import React from 'react';
import { Smartphone, Share, Plus, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useAddToHomeScreen } from '../hooks/useAddToHomeScreen';

export default function AddToHomeScreen() {
  const { isInstallable, isInstalled, isIOS, promptInstall } = useAddToHomeScreen();

  // Don't show anything if already installed
  if (isInstalled) {
    return (
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-sm">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <span className="text-muted-foreground">
              App is installed on your device
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show install button for browsers that support beforeinstallprompt
  if (isInstallable) {
    return (
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Smartphone className="h-5 w-5" />
            Add to Home Screen
          </CardTitle>
          <CardDescription>
            Install DAIRY FIELD app for quick access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={promptInstall} className="w-full" size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Install App
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Show instructions for iOS/Safari
  if (isIOS) {
    return (
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Smartphone className="h-5 w-5" />
            Add to Home Screen
          </CardTitle>
          <CardDescription>
            Install DAIRY FIELD app on your iPhone or iPad
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                1
              </div>
              <p className="text-muted-foreground">
                Tap the <Share className="inline h-4 w-4 mx-1" /> Share button at the bottom of your browser
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                2
              </div>
              <p className="text-muted-foreground">
                Scroll down and tap <strong>"Add to Home Screen"</strong>
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                3
              </div>
              <p className="text-muted-foreground">
                Tap <strong>"Add"</strong> in the top right corner
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Don't show anything if not installable and not iOS
  return null;
}
