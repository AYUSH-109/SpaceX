import { useState, useEffect, useRef } from "react";
import { PenTool, Bookmark, Download, Save, Search, Image, X, Edit2, Move } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import OpenSeadragon from "openseadragon";

const Viewer = () => {
  const [activeTool, setActiveTool] = useState(null);
  const [annotations, setAnnotations] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [bookmarkName, setBookmarkName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentCircle, setCurrentCircle] = useState(null);
  const [selectedCircle, setSelectedCircle] = useState(null);
  const [editingLabel, setEditingLabel] = useState(null);
  const [labelText, setLabelText] = useState("");
  const [dragMode, setDragMode] = useState(null); // 'move' or 'resize'
  const [dragStart, setDragStart] = useState(null);
  
  const viewerRef = useRef(null);
  const osdRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  
  // Sample lunar images
  const lunarImages = [
    { id: 1, name: "Apollo 11 Landing Site", url: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=2000&q=80" },
    { id: 2, name: "Lunar Crater Formation", url: "https://images.unsplash.com/photo-1506443432602-ac2fcd6f54e0?w=2000&q=80" },
    { id: 3, name: "Moon Surface Detail", url: "https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?w=2000&q=80" },
  ];

  useEffect(() => {
    if (viewerRef.current && !osdRef.current) {
      osdRef.current = OpenSeadragon({
        element: viewerRef.current,
        prefixUrl: "https://openseadragon.github.io/openseadragon/images/",
        tileSources: {
          type: 'image',
          url: lunarImages[0].url
        },
        showNavigationControl: true,
        navigationControlAnchor: OpenSeadragon.ControlAnchor.TOP_LEFT,
        gestureSettingsMouse: {
          clickToZoom: false
        }
      });
    }

    return () => {
      if (osdRef.current) {
        osdRef.current.destroy();
        osdRef.current = null;
      }
    };
  }, []);

  // Update canvas overlay position and size
  useEffect(() => {
    if (overlayRef.current && viewerRef.current) {
      const rect = viewerRef.current.getBoundingClientRect();
      overlayRef.current.width = rect.width;
      overlayRef.current.height = rect.height;
      redrawAnnotations();
    }
  }, [annotations, currentCircle]);

  const getMousePos = (e) => {
    const rect = overlayRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const calculateRadius = (start, end) => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const isPointInCircle = (point, circle) => {
    const dx = point.x - circle.centerX;
    const dy = point.y - circle.centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= circle.radius;
  };

  const isPointOnCircleEdge = (point, circle, threshold = 10) => {
    const dx = point.x - circle.centerX;
    const dy = point.y - circle.centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return Math.abs(distance - circle.radius) <= threshold;
  };

  const handleMouseDown = (e) => {
    if (activeTool !== 'annotate') return;
    
    const pos = getMousePos(e);
    
    // Check if clicking on existing circle
    const clickedCircle = annotations.find(ann => isPointInCircle(pos, ann));
    
    if (clickedCircle) {
      if (isPointOnCircleEdge(pos, clickedCircle)) {
        setDragMode('resize');
        setSelectedCircle(clickedCircle);
        setDragStart(pos);
      } else {
        setDragMode('move');
        setSelectedCircle(clickedCircle);
        setDragStart(pos);
      }
    } else {
      // Start drawing new circle
      setIsDrawing(true);
      setCurrentCircle({
        centerX: pos.x,
        centerY: pos.y,
        radius: 0
      });
    }
  };

  const handleMouseMove = (e) => {
    if (activeTool !== 'annotate') return;
    
    const pos = getMousePos(e);
    
    if (isDrawing && currentCircle) {
      const radius = calculateRadius(
        { x: currentCircle.centerX, y: currentCircle.centerY },
        pos
      );
      setCurrentCircle({ ...currentCircle, radius });
    } else if (dragMode === 'move' && selectedCircle && dragStart) {
      const dx = pos.x - dragStart.x;
      const dy = pos.y - dragStart.y;
      
      setAnnotations(annotations.map(ann => 
        ann.id === selectedCircle.id
          ? { ...ann, centerX: ann.centerX + dx, centerY: ann.centerY + dy }
          : ann
      ));
      setDragStart(pos);
      setSelectedCircle(prev => ({
        ...prev,
        centerX: prev.centerX + dx,
        centerY: prev.centerY + dy
      }));
    } else if (dragMode === 'resize' && selectedCircle && dragStart) {
      const newRadius = calculateRadius(
        { x: selectedCircle.centerX, y: selectedCircle.centerY },
        pos
      );
      
      setAnnotations(annotations.map(ann =>
        ann.id === selectedCircle.id
          ? { ...ann, radius: newRadius }
          : ann
      ));
      setSelectedCircle(prev => ({ ...prev, radius: newRadius }));
    }
  };

  const handleMouseUp = (e) => {
    if (isDrawing && currentCircle && currentCircle.radius > 10) {
      const newAnnotation = {
        id: Date.now(),
        ...currentCircle,
        label: ""
      };
      setAnnotations([...annotations, newAnnotation]);
      setEditingLabel(newAnnotation.id);
      setCurrentCircle(null);
    }
    
    setIsDrawing(false);
    setDragMode(null);
    setDragStart(null);
  };

  const redrawAnnotations = () => {
    const canvas = overlayRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw all saved annotations
    annotations.forEach(ann => {
      ctx.beginPath();
      ctx.arc(ann.centerX, ann.centerY, ann.radius, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      if (ann.label) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(ann.centerX - 50, ann.centerY - 15, 100, 30);
        ctx.fillStyle = 'white';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(ann.label, ann.centerX, ann.centerY + 5);
      }
    });
    
    // Draw current circle being drawn
    if (currentCircle && currentCircle.radius > 0) {
      ctx.beginPath();
      ctx.arc(currentCircle.centerX, currentCircle.centerY, currentCircle.radius, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  };

  const handleSaveLabel = () => {
    if (editingLabel && labelText.trim()) {
      setAnnotations(annotations.map(ann =>
        ann.id === editingLabel ? { ...ann, label: labelText } : ann
      ));
      setLabelText("");
      setEditingLabel(null);
      toast.success("Label added!");
    }
  };

  const handleDeleteAnnotation = (id) => {
    setAnnotations(annotations.filter(ann => ann.id !== id));
    toast.success("Annotation deleted");
  };

  const handleBookmark = () => {
    if (bookmarkName.trim()) {
      const viewport = osdRef.current.viewport;
      const center = viewport.getCenter();
      const zoom = viewport.getZoom();
      
      setBookmarks([...bookmarks, {
        id: Date.now(),
        name: bookmarkName,
        x: center.x,
        y: center.y,
        zoom: zoom
      }]);
      
      setBookmarkName("");
      setActiveTool(null);
      toast.success("Bookmark saved!");
    }
  };

  const goToBookmark = (bookmark) => {
    const viewport = osdRef.current.viewport;
    viewport.panTo(new OpenSeadragon.Point(bookmark.x, bookmark.y));
    viewport.zoomTo(bookmark.zoom);
  };

  const handleDownload = () => {
    toast.info("Download feature coming soon!");
  };
  
  const loadImage = (imageUrl) => {
    if (osdRef.current) {
      osdRef.current.open({
        type: 'image',
        url: imageUrl
      });
      toast.success("Image loaded!");
    }
  };
  
  const filteredImages = lunarImages.filter(img =>
    img.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    redrawAnnotations();
  }, [annotations, currentCircle]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-80 bg-card border-r border-border p-4 overflow-y-auto">
          <h2 className="text-xl font-bold mb-4 text-primary">Explorer Panel</h2>
          
          <div className="space-y-4">
            {/* Image Search */}
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Search className="h-4 w-4" />
                Image Library
              </h3>
              <Input
                placeholder="Search images..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-background/50 mb-3"
              />
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {filteredImages.map(img => (
                  <button
                    key={img.id}
                    onClick={() => loadImage(img.url)}
                    className="w-full p-2 bg-background/50 rounded text-sm text-left hover:bg-muted transition-colors flex items-center gap-2"
                  >
                    <Image className="h-4 w-4 text-muted-foreground" />
                    {img.name}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="border-t border-border pt-4">
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <PenTool className="h-4 w-4" />
                  Circle Annotation Tool
                </h3>
                <Button
                  onClick={() => {
                    setActiveTool(activeTool === 'annotate' ? null : 'annotate');
                  }}
                  variant={activeTool === 'annotate' ? 'default' : 'outline'}
                  className="w-full mb-2"
                >
                  {activeTool === 'annotate' ? 'Disable Tool' : 'Enable Circle Tool'}
                </Button>
              
                {activeTool === 'annotate' && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      Click and drag to draw circles. Click inside to move, on edge to resize.
                    </p>
                  </div>
                )}
              
                {annotations.length > 0 && (
                  <div className="mt-2 space-y-2">
                    <p className="text-xs text-muted-foreground mb-1">Saved Annotations:</p>
                    {annotations.map(ann => (
                      <div key={ann.id} className="p-2 bg-background/50 rounded text-sm">
                        <div className="flex items-start justify-between mb-1">
                          <p className="font-medium text-xs text-primary">Circle {ann.id}</p>
                          <button
                            onClick={() => handleDeleteAnnotation(ann.id)}
                            className="text-destructive hover:text-destructive/80"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                        <p className="text-xs">Center: ({Math.round(ann.centerX)}, {Math.round(ann.centerY)})</p>
                        <p className="text-xs">Radius: {Math.round(ann.radius)}px</p>
                        {ann.label && <p className="text-xs mt-1 font-medium">Label: {ann.label}</p>}
                        {!ann.label && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingLabel(ann.id);
                              setLabelText(ann.label || "");
                            }}
                            className="mt-1 h-6 text-xs"
                          >
                            <Edit2 className="h-3 w-3 mr-1" />
                            Add Label
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-border pt-4 mt-4">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Bookmark className="h-4 w-4" />
                  My Saves
                </h3>
                <Button
                  onClick={() => setActiveTool(activeTool === 'bookmark' ? null : 'bookmark')}
                  variant={activeTool === 'bookmark' ? 'default' : 'outline'}
                  className="w-full mb-2"
                >
                  {activeTool === 'bookmark' ? 'Cancel' : 'Add Bookmark'}
                </Button>
                
                {activeTool === 'bookmark' && (
                  <div className="space-y-2">
                    <Input
                      placeholder="Bookmark name..."
                      value={bookmarkName}
                      onChange={(e) => setBookmarkName(e.target.value)}
                      className="bg-background/50"
                    />
                    <Button onClick={handleBookmark} className="w-full">
                      <Save className="h-4 w-4 mr-2" />
                      Save Bookmark
                    </Button>
                  </div>
                )}
                
                {bookmarks.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {bookmarks.map(bm => (
                      <button
                        key={bm.id}
                        onClick={() => goToBookmark(bm)}
                        className="w-full p-2 bg-background/50 rounded text-sm text-left hover:bg-muted transition-colors"
                      >
                        {bm.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-border pt-4 mt-4">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download Selection
                </h3>
                <Button onClick={handleDownload} variant="outline" className="w-full">
                  Download Current View
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Viewer */}
        <div className="flex-1 relative bg-background">
          <div
            ref={viewerRef}
            className="absolute inset-0"
            style={{ background: '#000' }}
          />
          <canvas
            ref={overlayRef}
            className="absolute inset-0 pointer-events-none"
            style={{ pointerEvents: activeTool === 'annotate' ? 'auto' : 'none' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          />
          
          {/* Label Input Popup */}
          {editingLabel && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-card border border-border rounded-lg p-4 shadow-lg z-50 min-w-[300px]">
              <h4 className="font-semibold mb-2 text-foreground">Add Label</h4>
              <Input
                placeholder="Enter label text..."
                value={labelText}
                onChange={(e) => setLabelText(e.target.value)}
                className="mb-3 text-foreground"
                autoFocus
              />
              <div className="flex gap-2">
                <Button onClick={handleSaveLabel} className="flex-1">
                  Save
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setEditingLabel(null);
                    setLabelText("");
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Viewer;
