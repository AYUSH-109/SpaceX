import { useState, useEffect, useRef } from "react";
import { PenTool, Bookmark, Download, Save } from "lucide-react";
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
  const viewerRef = useRef(null);
  const osdRef = useRef(null);

  useEffect(() => {
    if (viewerRef.current && !osdRef.current) {
      osdRef.current = OpenSeadragon({
        element: viewerRef.current,
        prefixUrl: "https://openseadragon.github.io/openseadragon/images/",
        tileSources: {
          type: 'image',
          url: 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=2000&q=80'
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

  const handleAnnotate = () => {
    if (annotationText.trim()) {
      const viewport = osdRef.current.viewport;
      const center = viewport.getCenter();
      const zoom = viewport.getZoom();
      
      setAnnotations([...annotations, {
        id: Date.now(),
        text: annotationText,
        x: center.x,
        y: center.y,
        zoom: zoom
      }]);
      
      setAnnotationText("");
      setActiveTool(null);
      toast.success("Annotation saved!");
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-80 bg-card border-r border-border p-4 overflow-y-auto">
          <h2 className="text-xl font-bold mb-4 text-primary">Explorer Panel</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <PenTool className="h-4 w-4" />
                Annotation Tool
              </h3>
              <Button
                onClick={() => setActiveTool(activeTool === 'annotate' ? null : 'annotate')}
                variant={activeTool === 'annotate' ? 'default' : 'outline'}
                className="w-full mb-2"
              >
                {activeTool === 'annotate' ? 'Cancel' : 'Add Annotation'}
              </Button>
              
              {activeTool === 'annotate' && (
                <div className="space-y-2">
                  <Textarea
                    placeholder="Enter your annotation..."
                    value={annotationText}
                    onChange={(e) => setAnnotationText(e.target.value)}
                    className="bg-background/50"
                  />
                  <Button onClick={handleAnnotate} className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Save Annotation
                  </Button>
                </div>
              )}
              
              {annotations.length > 0 && (
                <div className="mt-2 space-y-2">
                  {annotations.map(ann => (
                    <div key={ann.id} className="p-2 bg-background/50 rounded text-sm">
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
