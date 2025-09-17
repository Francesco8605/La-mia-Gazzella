import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface TimerResponse {
  canGenerateNow: boolean;
  hoursRemaining: number;
  millisecondsRemaining: number;
  nextAllowedGeneration: string;
  lastGeneration: string | null;
  message: string;
}

interface MealPlanTimerProps {
  onTimerExpired?: () => void;
}

export default function MealPlanTimer({ onTimerExpired }: MealPlanTimerProps) {
  const { isAuthenticated } = useAuth();
  const hasTriggeredExpiry = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
  }>({ hours: 0, minutes: 0, seconds: 0 });

  const { data: timerData, refetch, error, isLoading } = useQuery<TimerResponse>({
    queryKey: ["/api/meal-plans/next-generation-time"],
    enabled: isAuthenticated,
    refetchInterval: 30000, // Refresh every 30 seconds to stay in sync
    retry: false,
  });

  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Reset expiry flag when timer data changes
    hasTriggeredExpiry.current = false;

    if (!timerData || timerData.canGenerateNow) {
      return;
    }

    const updateCountdown = () => {
      const now = new Date().getTime();
      const targetTime = new Date(timerData.nextAllowedGeneration).getTime();
      const difference = targetTime - now;

      if (difference <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        
        // Only trigger refetch and callback once
        if (!hasTriggeredExpiry.current) {
          hasTriggeredExpiry.current = true;
          refetch(); // Check if we can generate now
          onTimerExpired?.();
        }
        
        // Clear the interval to stop further updates
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    };

    // Update immediately
    updateCountdown();

    // Update every second
    intervalRef.current = setInterval(updateCountdown, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [timerData, refetch, onTimerExpired]);

  // Handle unauthenticated state first
  if (!isAuthenticated) {
    return (
      <Card data-testid="timer-unauthenticated">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Accedi per visualizzare il timer</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle error state
  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950" data-testid="timer-error">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <div>
                <p className="font-medium text-red-800 dark:text-red-200">
                  Errore nel controllo timer
                </p>
                <p className="text-sm text-red-600 dark:text-red-400">
                  Impossibile verificare quando puoi generare il prossimo piano
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900"
              data-testid="button-retry"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Riprova
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle loading state
  if (isLoading || !timerData) {
    return (
      <Card data-testid="timer-loading">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <Clock className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Controllo timer...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (timerData.canGenerateNow) {
    return (
      <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950" data-testid="timer-can-generate">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            <div>
              <p className="font-medium text-green-800 dark:text-green-200" data-testid="text-can-generate">
                {timerData.message}
              </p>
              {timerData.lastGeneration && (
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  Ultimo piano generato: {new Date(timerData.lastGeneration).toLocaleDateString('it-IT', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950" data-testid="timer-waiting">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-orange-800 dark:text-orange-200">
          <Clock className="h-5 w-5" />
          <span>Prossimo Piano Disponibile</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          <p className="text-sm text-orange-700 dark:text-orange-300" data-testid="text-waiting-message">
            {timerData.message}
          </p>
          
          <div className="flex items-center justify-center space-x-2" data-testid="countdown-display">
            <div className="text-center">
              <div className="bg-white dark:bg-gray-800 rounded-lg px-3 py-2 border border-orange-200 dark:border-orange-700">
                <div className="text-2xl font-bold text-orange-800 dark:text-orange-200" data-testid="countdown-hours">
                  {timeLeft.hours.toString().padStart(2, '0')}
                </div>
                <div className="text-xs text-orange-600 dark:text-orange-400">ore</div>
              </div>
            </div>
            <div className="text-orange-600 dark:text-orange-400 text-xl font-bold">:</div>
            <div className="text-center">
              <div className="bg-white dark:bg-gray-800 rounded-lg px-3 py-2 border border-orange-200 dark:border-orange-700">
                <div className="text-2xl font-bold text-orange-800 dark:text-orange-200" data-testid="countdown-minutes">
                  {timeLeft.minutes.toString().padStart(2, '0')}
                </div>
                <div className="text-xs text-orange-600 dark:text-orange-400">min</div>
              </div>
            </div>
            <div className="text-orange-600 dark:text-orange-400 text-xl font-bold">:</div>
            <div className="text-center">
              <div className="bg-white dark:bg-gray-800 rounded-lg px-3 py-2 border border-orange-200 dark:border-orange-700">
                <div className="text-2xl font-bold text-orange-800 dark:text-orange-200" data-testid="countdown-seconds">
                  {timeLeft.seconds.toString().padStart(2, '0')}
                </div>
                <div className="text-xs text-orange-600 dark:text-orange-400">sec</div>
              </div>
            </div>
          </div>

          {timerData.lastGeneration && (
            <div className="text-center pt-2 border-t border-orange-200 dark:border-orange-700">
              <p className="text-xs text-orange-600 dark:text-orange-400">
                Ultimo piano generato il {new Date(timerData.lastGeneration).toLocaleDateString('it-IT', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}