import { useState, useEffect, useRef } from "react";
import { PenTool, Bookmark, Download, Save, Search, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import OpenSeadragon from "openseadragon";

const Viewer = () => {
  const [activeTool, setActiveTool] = useState(null);
  const [annotations, setAnnotations] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [annotationText, setAnnotationText] = useState("");
  const [bookmarkName, setBookmarkName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState(null);
  const [selectionEnd, setSelectionEnd] = useState(null);
  const viewerRef = useRef(null);
  const osdRef = useRef(null);
  
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
      
      // Add mouse event handlers for area selection
      const canvas = osdRef.current.canvas;
      canvas.addEventListener('mousedown', handleMouseDown);
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      if (osdRef.current) {
        const canvas = osdRef.current.canvas;
        canvas?.removeEventListener('mousedown', handleMouseDown);
        canvas?.removeEventListener('mousemove', handleMouseMove);
        canvas?.removeEventListener('mouseup', handleMouseUp);
        osdRef.current.destroy();
        osdRef.current = null;
      }
    };
  }, []);

  const handleMouseDown = (e) => {
    if (activeTool === 'annotate' && !isSelecting) {
      setIsSelecting(true);
      setSelectionStart({ x: e.clientX, y: e.clientY });
    }
  };
  
  const handleMouseMove = (e) => {
    if (isSelecting && activeTool === 'annotate') {
      setSelectionEnd({ x: e.clientX, y: e.clientY });
    }
  };
  
  const handleMouseUp = (e) => {
    if (isSelecting && activeTool === 'annotate') {
      setIsSelecting(false);
      setSelectionEnd({ x: e.clientX, y: e.clientY });
      // Selection is ready for annotation
    }
  };

  const handleAnnotate = () => {
    if (annotationText.trim() && selectionStart && selectionEnd) {
      const viewport = osdRef.current.viewport;
      const center = viewport.getCenter();
      const zoom = viewport.getZoom();
      
      setAnnotations([...annotations, {
        id: Date.now(),
        text: annotationText,
        x: center.x,
        y: center.y,
        zoom: zoom,
        selection: { start: selectionStart, end: selectionEnd }
      }]);
      
      setAnnotationText("");
      setActiveTool(null);
      setSelectionStart(null);
      setSelectionEnd(null);
      toast.success("Area annotation saved!");
    } else if (annotationText.trim()) {
      toast.error("Please select an area on the image first");
    }
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
                  Area Annotation Tool
                </h3>
                <Button
                  onClick={() => {
                    setActiveTool(activeTool === 'annotate' ? null : 'annotate');
                    setSelectionStart(null);
                    setSelectionEnd(null);
                  }}
                  variant={activeTool === 'annotate' ? 'default' : 'outline'}
                  className="w-full mb-2"
                >
                  {activeTool === 'annotate' ? 'Cancel Selection' : 'Select Area & Annotate'}
                </Button>
              
                {activeTool === 'annotate' && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      {selectionStart && selectionEnd ? 'Area selected. Add notes below.' : 'Click and drag on the image to select an area'}
                    </p>
                    <Textarea
                      placeholder="Enter annotation for selected area..."
                      value={annotationText}
                      onChange={(e) => setAnnotationText(e.target.value)}
                      className="bg-background/50"
                    />
                    <Button onClick={handleAnnotate} className="w-full">
                      <Save className="h-4 w-4 mr-2" />
                      Save Area Annotation
                    </Button>
                  </div>
                )}
              
                {annotations.length > 0 && (
                  <div className="mt-2 space-y-2">
                    <p className="text-xs text-muted-foreground mb-1">Saved Annotations:</p>
                    {annotations.map(ann => (
                      <div key={ann.id} className="p-2 bg-background/50 rounded text-sm">
                        <p className="font-medium text-xs text-primary mb-1">Area Selection</p>
                        {ann.text}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-border pt-4">
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

              <div className="border-t border-border pt-4">
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
        </div>
      </div>
    </div>
  );
};

export default Viewer;
