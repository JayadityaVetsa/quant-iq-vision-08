
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UploadModal = ({ isOpen, onClose }: UploadModalProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [initialValue, setInitialValue] = useState("10000");
  const [riskFreeRate, setRiskFreeRate] = useState("3.0");
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a CSV file to upload.",
        variant: "destructive",
      });
      return;
    }

    // Simulate file processing
    toast({
      title: "Portfolio uploaded successfully",
      description: "Your portfolio data has been processed and is ready for analysis.",
    });

    // Reset form and close modal
    setSelectedFile(null);
    setInitialValue("10000");
    setRiskFreeRate("3.0");
    onClose();
  };

  const handleClose = () => {
    setSelectedFile(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Upload className="w-5 h-5 text-blue-600" />
            <span>Upload Portfolio CSV</span>
          </DialogTitle>
          <DialogDescription>
            Upload your portfolio CSV file to get started with analysis. 
            Format: Ticker, Weight (e.g., AAPL, 0.25)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="csv-file">Portfolio CSV File</Label>
            <div className="relative">
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            {selectedFile && (
              <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 p-2 rounded-lg">
                <FileText className="w-4 h-4" />
                <span>{selectedFile.name}</span>
                <button 
                  onClick={() => setSelectedFile(null)}
                  className="ml-auto text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Initial Portfolio Value */}
          <div className="space-y-2">
            <Label htmlFor="initial-value">Initial Portfolio Value ($)</Label>
            <Input
              id="initial-value"
              type="number"
              value={initialValue}
              onChange={(e) => setInitialValue(e.target.value)}
              placeholder="10000"
            />
          </div>

          {/* Risk-Free Rate */}
          <div className="space-y-2">
            <Label htmlFor="risk-free-rate">Risk-Free Rate (%)</Label>
            <Input
              id="risk-free-rate"
              type="number"
              step="0.1"
              value={riskFreeRate}
              onChange={(e) => setRiskFreeRate(e.target.value)}
              placeholder="3.0"
            />
          </div>

          {/* CSV Format Help */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h4 className="font-medium text-slate-800 mb-2">CSV Format Example:</h4>
            <pre className="text-xs text-slate-600 bg-white p-2 rounded border">
{`Ticker,Weight
AAPL,0.25
GOOGL,0.20
MSFT,0.15
TSLA,0.10
SPY,0.30`}
            </pre>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpload}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload & Analyze
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
