import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Undo, Redo, Save, Eraser, MessageSquare, Maximize, Minimize,
  ZoomIn, ZoomOut, Move, RotateCcw, X
} from "lucide-react";
import "@/styles/blackboard.css";

const Blackboard = () => {
  const normalCanvasRef = useRef<HTMLCanvasElement>(null);
  const fullscreenCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [aiHint, setAiHint] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const blackboardContainerRef = useRef<HTMLDivElement>(null);

  // Zoom and pan state
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isPanMode, setIsPanMode] = useState(false);

  // Get the active canvas reference based on the current mode
  const getActiveCanvasRef = () => isFullScreen ? fullscreenCanvasRef : normalCanvasRef;

  // Initialize the normal canvas
  useEffect(() => {
    const canvas = normalCanvasRef.current;
    if (!canvas) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const context = canvas.getContext("2d");
    if (context) {
      // Set drawing style
      context.lineCap = "round";
      context.lineJoin = "round";
      context.strokeStyle = "white";
      context.lineWidth = 2;
      setCtx(context);

      // Draw the grid
      drawGrid(context, canvas);

      const initialState = context.getImageData(0, 0, canvas.width, canvas.height);
      setHistory([initialState]);
      setHistoryIndex(0);

      // Handle window resize
      const handleResize = () => {
        if (!canvas) return;

        // Save current drawing
        try {
          currentDrawingRef.current = context.getImageData(0, 0, canvas.width, canvas.height);
        } catch (e) {
          console.error("Failed to save drawing during resize:", e);
        }

        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        // Set drawing style
        context.lineCap = "round";
        context.lineJoin = "round";
        context.strokeStyle = "white";
        context.lineWidth = 2;

        // Redraw the grid
        drawGrid(context, canvas);

        // Restore drawing if we have one saved
        if (currentDrawingRef.current) {
          try {
            // Create a temporary canvas to scale the image if needed
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');

            if (tempCtx) {
              // Set temp canvas to the size of the original image
              tempCanvas.width = currentDrawingRef.current.width;
              tempCanvas.height = currentDrawingRef.current.height;

              // Put the image data on the temp canvas
              tempCtx.putImageData(currentDrawingRef.current, 0, 0);

              // Draw the temp canvas onto the main canvas, scaling if needed
              context.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
            }
          } catch (e) {
            console.error("Failed to restore drawing during resize:", e);
          }
        }
      };

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!ctx) return;

    // If alt key is pressed or middle mouse button, handle as pan instead
    if ('button' in e && (e.altKey || e.button === 1) && isFullScreen) {
      return;
    }

    setIsDrawing(true);

    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const canvas = getActiveCanvasRef().current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    let x = clientX - rect.left;
    let y = clientY - rect.top;

    // Apply transform for fullscreen mode
    if (isFullScreen) {
      // Convert screen coordinates to canvas coordinates with zoom and pan
      x = (x - offset.x) / scale;
      y = (y - offset.y) / scale;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !ctx) return;

    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      e.preventDefault();
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const canvas = getActiveCanvasRef().current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    let x = clientX - rect.left;
    let y = clientY - rect.top;

    // Apply transform for fullscreen mode
    if (isFullScreen) {
      // Convert screen coordinates to canvas coordinates with zoom and pan
      x = (x - offset.x) / scale;
      y = (y - offset.y) / scale;

      // Save current transform
      ctx.save();

      // Apply transform
      ctx.setTransform(scale, 0, 0, scale, offset.x, offset.y);

      // Draw line
      ctx.lineTo(x, y);
      ctx.stroke();

      // Restore transform
      ctx.restore();
    } else {
      // Normal drawing without transform
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    // Add drawing effect
    createDrawingEffect(clientX, clientY);
  };

  // Function to create drawing effect
  const createDrawingEffect = (x: number, y: number) => {
    // Get the active drawing effects container based on current mode
    const containerId = isFullScreen ? 'drawing-effects-fullscreen' : 'drawing-effects-normal';
    const effectsContainer = document.getElementById(containerId);
    if (!effectsContainer) return;

    const effect = document.createElement('div');
    effect.className = 'drawing-effect';
    effect.style.left = `${x}px`;
    effect.style.top = `${y}px`;

    effectsContainer.appendChild(effect);

    // Remove the effect after animation completes
    setTimeout(() => {
      effect.remove();
    }, 500);
  };

  const stopDrawing = () => {
    if (!isDrawing || !ctx) return;

    setIsDrawing(false);
    ctx.closePath();

    const canvas = getActiveCanvasRef().current;
    if (!canvas) return;

    const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const newHistory = history.slice(0, historyIndex + 1);
    setHistory([...newHistory, currentState]);
    setHistoryIndex(newHistory.length);

    // Save the current drawing for potential mode switching
    currentDrawingRef.current = currentState;
  };

  const undo = () => {
    if (historyIndex <= 0 || !ctx) return;

    setHistoryIndex(historyIndex - 1);

    const canvas = getActiveCanvasRef().current;
    if (!canvas) return;

    ctx.putImageData(history[historyIndex - 1], 0, 0);

    // Update the current drawing reference
    currentDrawingRef.current = history[historyIndex - 1];
  };

  const redo = () => {
    if (historyIndex >= history.length - 1 || !ctx) return;

    setHistoryIndex(historyIndex + 1);

    const canvas = getActiveCanvasRef().current;
    if (!canvas) return;

    ctx.putImageData(history[historyIndex + 1], 0, 0);

    // Update the current drawing reference
    currentDrawingRef.current = history[historyIndex + 1];
  };

  const clearCanvas = () => {
    if (!ctx) return;

    const canvas = getActiveCanvasRef().current;
    if (!canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Redraw the grid after clearing
    drawGrid(ctx, canvas);

    const clearedState = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const newHistory = history.slice(0, historyIndex + 1);
    setHistory([...newHistory, clearedState]);
    setHistoryIndex(newHistory.length);

    // Update the current drawing reference
    currentDrawingRef.current = clearedState;
  };

  const requestAIHint = () => {
    setAiHint("Try using the quotient rule for this derivative problem.");

    setTimeout(() => {
      setAiHint(null);
    }, 5000);
  };

  // Function to draw grid pattern
  const drawGrid = (context: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    // Save the current context state
    context.save();

    // Set grid style
    context.strokeStyle = "rgba(255, 255, 255, 0.05)";
    context.lineWidth = 0.5;

    // Draw grid lines
    const gridSize = 30;
    const width = canvas.width;
    const height = canvas.height;

    // Vertical lines
    for (let x = 0; x <= width; x += gridSize) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, height);
      context.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= height; y += gridSize) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(width, y);
      context.stroke();
    }

    // Restore the context state
    context.restore();

    // Reset drawing style
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = "white";
    context.lineWidth = 2;
  };

  // Store the current drawing in a ref to preserve it between mode changes
  const currentDrawingRef = useRef<ImageData | null>(null);

  const toggleFullScreen = () => {
    // Get the current active canvas
    const currentCanvas = getActiveCanvasRef().current;

    // Save the current drawing before changing modes
    if (currentCanvas && ctx) {
      try {
        currentDrawingRef.current = ctx.getImageData(0, 0, currentCanvas.width, currentCanvas.height);
      } catch (e) {
        console.error("Failed to save current drawing:", e);
      }
    }

    // Toggle full screen state
    setIsFullScreen(prevState => !prevState);

    // We need to initialize the new canvas after the state change and DOM update
    setTimeout(() => {
      // Get the new active canvas based on the updated state
      const newCanvas = getActiveCanvasRef().current;
      if (!newCanvas) return;

      // Get new context
      const context = newCanvas.getContext("2d");
      if (!context) return;

      // Update the context reference
      setCtx(context);

      // Resize canvas
      newCanvas.width = newCanvas.offsetWidth;
      newCanvas.height = newCanvas.offsetHeight;

      // Restore drawing style
      context.lineCap = "round";
      context.lineJoin = "round";
      context.strokeStyle = "white";
      context.lineWidth = 2;

      // Draw the grid
      drawGrid(context, newCanvas);

      // Restore drawing if we have one saved
      if (currentDrawingRef.current) {
        try {
          // Create a temporary canvas to scale the image if needed
          const tempCanvas = document.createElement('canvas');
          const tempCtx = tempCanvas.getContext('2d');

          if (tempCtx) {
            // Set temp canvas to the size of the original image
            tempCanvas.width = currentDrawingRef.current.width;
            tempCanvas.height = currentDrawingRef.current.height;

            // Put the image data on the temp canvas
            tempCtx.putImageData(currentDrawingRef.current, 0, 0);

            // Clear the main canvas
            context.clearRect(0, 0, newCanvas.width, newCanvas.height);

            // Draw the grid again
            drawGrid(context, newCanvas);

            // Draw the temp canvas onto the main canvas, scaling if needed
            context.drawImage(tempCanvas, 0, 0, newCanvas.width, newCanvas.height);

            // Save this as a new history state
            const newState = context.getImageData(0, 0, newCanvas.width, newCanvas.height);
            setHistory([...history.slice(0, historyIndex + 1), newState]);
            setHistoryIndex(historyIndex + 1);
          }
        } catch (e) {
          console.error("Failed to restore drawing:", e);
          // If restoration fails, at least draw the grid
          drawGrid(context, newCanvas);
        }
      }
    }, 300); // Longer delay to ensure DOM has fully updated
  };

  // Handle escape key to exit full screen
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false);
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [isFullScreen]);

  // Zoom and pan handlers
  const handleWheel = (e: React.WheelEvent) => {
    if (!isFullScreen) return;

    e.preventDefault();

    // Calculate new scale
    const delta = e.deltaY * -0.01;
    const newScale = Math.min(Math.max(0.1, scale + delta), 10);

    // Get mouse position relative to canvas
    const canvas = fullscreenCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Calculate new offset to zoom toward mouse position
    const newOffsetX = offset.x - (mouseX / scale - mouseX / newScale) * newScale;
    const newOffsetY = offset.y - (mouseY / scale - mouseY / newScale) * newScale;

    setScale(newScale);
    setOffset({ x: newOffsetX, y: newOffsetY });

    // Redraw canvas with new scale and offset
    redrawCanvas();
  };

  const startPan = (e: React.MouseEvent) => {
    if (!isFullScreen || isDrawing) return;

    // Only start panning with middle mouse button or when holding alt key
    if (e.button === 1 || e.altKey) {
      setIsDragging(true);
      setIsPanMode(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    }
  };

  const pan = (e: React.MouseEvent) => {
    if (!isFullScreen || !isDragging) return;

    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;

    setOffset({
      x: offset.x + dx / scale,
      y: offset.y + dy / scale
    });

    setDragStart({ x: e.clientX, y: e.clientY });

    // Redraw canvas with new offset
    redrawCanvas();
  };

  const endPan = () => {
    setIsDragging(false);
    setIsPanMode(false);
  };

  // Handle key down for alt key (pan mode)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Alt' && isFullScreen) {
        setIsPanMode(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Alt' && isFullScreen) {
        setIsPanMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isFullScreen]);

  // Function to redraw the canvas with current scale and offset
  const redrawCanvas = () => {
    if (!isFullScreen) return;

    const canvas = fullscreenCanvasRef.current;
    if (!canvas || !ctx) return;

    // Save current drawing
    let currentDrawing;
    try {
      currentDrawing = ctx.getImageData(0, 0, canvas.width, canvas.height);
    } catch (e) {
      console.error("Failed to save drawing during redraw:", e);
      return;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply transform
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);

    // Draw grid with transform
    drawGridWithTransform(ctx, canvas, scale, offset);

    // Restore drawing if we have one
    if (currentDrawingRef.current) {
      try {
        // Create a temporary canvas to scale the image
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');

        if (tempCtx) {
          // Set temp canvas to the size of the original image
          tempCanvas.width = currentDrawingRef.current.width;
          tempCanvas.height = currentDrawingRef.current.height;

          // Put the image data on the temp canvas
          tempCtx.putImageData(currentDrawingRef.current, 0, 0);

          // Draw the temp canvas onto the main canvas with transform
          ctx.drawImage(tempCanvas, 0, 0);
        }
      } catch (e) {
        console.error("Failed to restore drawing during redraw:", e);
      }
    }

    ctx.restore();
  };

  // Draw grid with transform
  const drawGridWithTransform = (
    context: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    currentScale: number,
    currentOffset: { x: number, y: number }
  ) => {
    // Save the current context state
    context.save();

    // Set grid style
    context.strokeStyle = "rgba(255, 255, 255, 0.05)";
    context.lineWidth = 0.5 / currentScale; // Adjust line width based on scale

    // Calculate grid size based on scale
    const baseGridSize = 30;
    const gridSize = baseGridSize;

    // Calculate visible area in canvas coordinates
    const visibleLeft = -currentOffset.x / currentScale;
    const visibleTop = -currentOffset.y / currentScale;
    const visibleRight = (canvas.width / currentScale) - (currentOffset.x / currentScale);
    const visibleBottom = (canvas.height / currentScale) - (currentOffset.y / currentScale);

    // Calculate grid lines to draw
    const startX = Math.floor(visibleLeft / gridSize) * gridSize;
    const endX = Math.ceil(visibleRight / gridSize) * gridSize;
    const startY = Math.floor(visibleTop / gridSize) * gridSize;
    const endY = Math.ceil(visibleBottom / gridSize) * gridSize;

    // Draw vertical lines
    for (let x = startX; x <= endX; x += gridSize) {
      context.beginPath();
      context.moveTo(x, startY);
      context.lineTo(x, endY);
      context.stroke();
    }

    // Draw horizontal lines
    for (let y = startY; y <= endY; y += gridSize) {
      context.beginPath();
      context.moveTo(startX, y);
      context.lineTo(endX, y);
      context.stroke();
    }

    // Restore the context state
    context.restore();
  };

  // Initialize the fullscreen canvas when it's mounted
  useEffect(() => {
    if (!isFullScreen) return;

    // This effect runs when fullscreen mode is activated
    const canvas = fullscreenCanvasRef.current;
    if (!canvas) return;

    // Initialize the canvas
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const context = canvas.getContext("2d");
    if (!context) return;

    // Update the context reference
    setCtx(context);

    // Set drawing style
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = "white";
    context.lineWidth = 2;

    // Draw the grid
    drawGrid(context, canvas);

    // Restore drawing if we have one saved
    if (currentDrawingRef.current) {
      try {
        // Create a temporary canvas to scale the image
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');

        if (tempCtx) {
          // Set temp canvas to the size of the original image
          tempCanvas.width = currentDrawingRef.current.width;
          tempCanvas.height = currentDrawingRef.current.height;

          // Put the image data on the temp canvas
          tempCtx.putImageData(currentDrawingRef.current, 0, 0);

          // Draw the temp canvas onto the main canvas, scaling if needed
          context.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
        }
      } catch (e) {
        console.error("Failed to restore drawing in fullscreen mode:", e);
      }
    }
  }, [isFullScreen]);

  return (
    <>
      {/* Normal mode */}
      {!isFullScreen && (
        <div className="w-full max-w-md mx-auto flex flex-col h-full">
          <div ref={blackboardContainerRef} className="glass-morphism rounded-3xl p-4 flex flex-col flex-1 mb-4 blackboard-container">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-center flex items-center justify-center gap-2 flex-shrink-0 blackboard-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-calculator-primary">
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="9" y1="21" x2="9" y2="9"></line>
                </svg>
                Interactive Blackboard
              </h2>

              {/* Full screen button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={toggleFullScreen}
                className="p-2 rounded-xl bg-calculator-button text-white hover:bg-calculator-operator blackboard-button"
                aria-label="Enter full screen"
              >
                <Maximize size={18} />
              </motion.button>
            </div>

            <div className="relative flex-1 mb-4 bg-[#121520] rounded-2xl overflow-hidden blackboard-canvas-container">
              <canvas
                id="normal-canvas"
                ref={normalCanvasRef}
                className="absolute inset-0 w-full h-full touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />

              {aiHint && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute bottom-4 left-4 right-4 bg-calculator-primary/90 p-3 rounded-xl text-white ai-hint"
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare size={16} className="animate-pulse" />
                    <p className="text-sm">{aiHint}</p>
                  </div>
                </motion.div>
              )}

              {/* Drawing effect elements will be added dynamically */}
              <div id="drawing-effects-normal"></div>
            </div>

            <div className="flex gap-2 justify-center">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={undo}
                disabled={historyIndex <= 0}
                className={`p-3 rounded-xl ${
                  historyIndex <= 0
                    ? "bg-calculator-button text-calculator-muted"
                    : "bg-calculator-button text-white hover:bg-calculator-operator blackboard-button"
                }`}
              >
                <Undo size={20} />
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                className={`p-3 rounded-xl ${
                  historyIndex >= history.length - 1
                    ? "bg-calculator-button text-calculator-muted"
                    : "bg-calculator-button text-white hover:bg-calculator-operator blackboard-button"
                }`}
              >
                <Redo size={20} />
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={clearCanvas}
                className="p-3 rounded-xl bg-calculator-button text-white hover:bg-red-500/80 blackboard-button"
              >
                <Eraser size={20} />
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  alert("Login required to save work");
                }}
                className="p-3 rounded-xl bg-calculator-button text-white hover:bg-calculator-operator blackboard-button"
              >
                <Save size={20} />
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={requestAIHint}
                className="p-3 px-4 rounded-xl bg-calculator-primary text-white ml-2 blackboard-button blackboard-button-primary"
              >
                Get Hint
              </motion.button>
            </div>
          </div>
        </div>
      )}

      {/* Full screen mode */}
      <AnimatePresence>
        {isFullScreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fullscreen-blackboard"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-white flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-calculator-primary">
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="9" y1="21" x2="9" y2="9"></line>
                </svg>
                Interactive Blackboard
              </h2>

              {/* Exit full screen button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={toggleFullScreen}
                className="p-2 rounded-xl bg-calculator-button text-white hover:bg-red-500/80 blackboard-button"
                aria-label="Exit full screen"
              >
                <Minimize size={18} />
              </motion.button>
            </div>

            <div className="relative flex-1 bg-[#121520] rounded-2xl overflow-hidden fullscreen-canvas-container">
              <canvas
                id="fullscreen-canvas"
                ref={fullscreenCanvasRef}
                className={`absolute inset-0 w-full h-full touch-none ${isPanMode ? 'cursor-move' : 'cursor-crosshair'}`}
                onMouseDown={(e) => {
                  startPan(e);
                  startDrawing(e);
                }}
                onMouseMove={(e) => {
                  pan(e);
                  draw(e);
                }}
                onMouseUp={() => {
                  stopDrawing();
                  endPan();
                }}
                onMouseLeave={() => {
                  stopDrawing();
                  endPan();
                }}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                onWheel={handleWheel}
              />

              {/* Drawing effect elements will be added dynamically */}
              <div id="drawing-effects-fullscreen"></div>

              {/* Floating toolbar in full screen mode */}
              <div className="floating-toolbar">
                {/* Drawing tools */}
                <div className="flex gap-1 mr-2 border-r border-calculator-primary/30 pr-2">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={undo}
                    disabled={historyIndex <= 0}
                    className={`p-2 rounded-xl ${
                      historyIndex <= 0
                        ? "bg-calculator-button text-calculator-muted"
                        : "bg-calculator-button text-white hover:bg-calculator-operator blackboard-button"
                    }`}
                    title="Undo"
                  >
                    <Undo size={18} />
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={redo}
                    disabled={historyIndex >= history.length - 1}
                    className={`p-2 rounded-xl ${
                      historyIndex >= history.length - 1
                        ? "bg-calculator-button text-calculator-muted"
                        : "bg-calculator-button text-white hover:bg-calculator-operator blackboard-button"
                    }`}
                    title="Redo"
                  >
                    <Redo size={18} />
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={clearCanvas}
                    className="p-2 rounded-xl bg-calculator-button text-white hover:bg-red-500/80 blackboard-button"
                    title="Erase All"
                  >
                    <Eraser size={18} />
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      alert("Login required to save work");
                    }}
                    className="p-2 rounded-xl bg-calculator-button text-white hover:bg-calculator-operator blackboard-button"
                    title="Save"
                  >
                    <Save size={18} />
                  </motion.button>
                </div>

                {/* Zoom controls */}
                <div className="flex gap-1 items-center">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      const newScale = Math.max(0.1, scale - 0.2);
                      setScale(newScale);
                      redrawCanvas();
                    }}
                    className="p-2 rounded-xl bg-calculator-button text-white hover:bg-calculator-operator blackboard-button"
                    title="Zoom Out"
                  >
                    <ZoomOut size={18} />
                  </motion.button>

                  <div className="text-white text-xs bg-calculator-bg/80 px-2 py-1 rounded-md">
                    {Math.round(scale * 100)}%
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      const newScale = Math.min(10, scale + 0.2);
                      setScale(newScale);
                      redrawCanvas();
                    }}
                    className="p-2 rounded-xl bg-calculator-button text-white hover:bg-calculator-operator blackboard-button"
                    title="Zoom In"
                  >
                    <ZoomIn size={18} />
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setScale(1);
                      setOffset({ x: 0, y: 0 });
                      redrawCanvas();
                    }}
                    className="p-2 rounded-xl bg-calculator-button text-white hover:bg-calculator-operator blackboard-button"
                    title="Reset View"
                  >
                    <RotateCcw size={18} />
                  </motion.button>

                  <div className="flex gap-1">
                    <div className="text-white text-xs bg-calculator-primary/80 px-2 py-1 rounded-md flex items-center gap-1">
                      <Move size={14} />
                      <span>Alt + Drag to Pan</span>
                    </div>
                    <div className="text-white text-xs bg-calculator-primary/80 px-2 py-1 rounded-md flex items-center gap-1">
                      <ZoomIn size={14} />
                      <span>Scroll to Zoom</span>
                    </div>
                  </div>
                </div>
              </div>

              {aiHint && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute bottom-4 left-4 right-4 max-w-md mx-auto bg-calculator-primary/90 p-3 rounded-xl text-white ai-hint"
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare size={16} className="animate-pulse" />
                    <p className="text-sm">{aiHint}</p>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Blackboard;
