"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/apiClient";

interface CampaignAnalytics {
  sent: number;
  delivered: number;
  read: number;
  failed: number;
}

// If you are still seeing an error, please try clearing your browser cache and restarting the development server.
export default function CampaignAnalyticsPage() {
  const { id } = useParams();
  const [analytics, setAnalytics] = useState<CampaignAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchAnalytics = async () => {
        try {
          const data = await apiRequest(
            `/api/campaigns/${id}/analytics`,
            "GET"
          );
          setAnalytics(data);
        } catch (error) {
          setError("Failed to fetch campaign analytics.");
          console.error(error);
        } finally {
          setLoading(false);
        }
      };

      fetchAnalytics();
    }
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!analytics) {
    return <div>No analytics data available.</div>;
  }

  const handleDownloadCsv = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/campaigns/${id}/analytics/download`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to download CSV");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `campaign-analytics-${id}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error("Error downloading CSV:", error);
      setError("Failed to download CSV.");
    }
  };

  const totalMessages = analytics.sent + analytics.delivered + analytics.read + analytics.failed;

  const getPercentage = (count: number) => {
    if (totalMessages === 0) {
      return "0%";
    }
    return `${((count / totalMessages) * 100).toFixed(2)}%`;
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Campaign Analytics</h1>
        <Button onClick={handleDownloadCsv}>Download CSV</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{analytics.sent}</p>
            <p className="text-sm text-muted-foreground">{getPercentage(analytics.sent)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Delivered</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{analytics.delivered}</p>
            <p className="text-sm text-muted-foreground">{getPercentage(analytics.delivered)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Read</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{analytics.read}</p>
            <p className="text-sm text-muted-foreground">{getPercentage(analytics.read)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{analytics.failed}</p>
            <p className="text-sm text-muted-foreground">{getPercentage(analytics.failed)}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
