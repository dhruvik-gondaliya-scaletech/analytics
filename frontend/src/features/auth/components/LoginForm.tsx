import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { LogIn } from "lucide-react";

interface LoginFormProps {
  onSubmit: (apiKey: string) => void;
  isLoading: boolean;
}

export function LoginForm({ onSubmit, isLoading }: LoginFormProps) {
  const [apiKey, setApiKey] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onSubmit(apiKey.trim());
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      
      <Card className="z-10 w-full max-w-md border-border/50 bg-background/60 backdrop-blur-xl shadow-2xl transition-all duration-300 hover:shadow-primary/5">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 shadow-inner">
            <LogIn className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-3xl font-extrabold tracking-tight">Welcome Back</CardTitle>
          <CardDescription className="text-muted-foreground text-base">
            Enter your API key to access your analytics dashboard
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="apiKey" className="text-sm font-semibold">
                API Key
              </Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="ak_live_..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                required
                className="bg-background/50 h-11 text-base focus-visible:ring-primary focus-visible:ring-offset-2 transition-all"
              />
            </div>
          </CardContent>
          <CardFooter className="pt-2">
            <Button 
              type="submit" 
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all duration-300 hover:shadow-primary/20 hover:-translate-y-0.5 text-base font-semibold rounded-lg"
              disabled={isLoading || !apiKey.trim()}
            >
              {isLoading ? "Authenticating..." : "Sign In"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
