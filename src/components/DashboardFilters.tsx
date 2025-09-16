import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Download } from "lucide-react";

interface DashboardFiltersProps {
  onDateRangeChange: (startDate: string, endDate: string) => void;
  onCampaignChange: (campaignId: string) => void;
  campaigns: Array<{ id: string; name: string }>;
  onExportReport: () => void;
}

export function DashboardFilters({ onDateRangeChange, onCampaignChange, campaigns, onExportReport }: DashboardFiltersProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleDateRangeSubmit = () => {
    if (startDate && endDate) {
      onDateRangeChange(startDate, endDate);
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <Label htmlFor="startDate">Data Início</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          
          <div className="flex-1 min-w-[200px]">
            <Label htmlFor="endDate">Data Fim</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          
          <div className="flex-1 min-w-[200px]">
            <Label>Campanha</Label>
            <Select onValueChange={onCampaignChange}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as campanhas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as campanhas</SelectItem>
                {campaigns.map((campaign) => (
                  <SelectItem key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button onClick={handleDateRangeSubmit}>
            <CalendarIcon className="h-4 w-4 mr-2" />
            Aplicar Filtros
          </Button>
          
          <Button onClick={onExportReport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Relatório Executivo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}