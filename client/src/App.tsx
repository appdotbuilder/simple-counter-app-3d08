
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import type { Counter } from '../../server/src/schema';

function App() {
  const [counter, setCounter] = useState<Counter | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadCounter = useCallback(async () => {
    try {
      const result = await trpc.getCounter.query();
      setCounter(result);
    } catch (error) {
      console.error('Failed to load counter:', error);
    }
  }, []);

  useEffect(() => {
    loadCounter();
  }, [loadCounter]);

  const handleIncrement = async (amount: number = 1) => {
    setIsLoading(true);
    try {
      const result = await trpc.incrementCounter.mutate({ amount });
      setCounter(result);
    } catch (error) {
      console.error('Failed to increment counter:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecrement = async (amount: number = 1) => {
    setIsLoading(true);
    try {
      const result = await trpc.decrementCounter.mutate({ amount });
      setCounter(result);
    } catch (error) {
      console.error('Failed to decrement counter:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async (value: number = 0) => {
    setIsLoading(true);
    try {
      const result = await trpc.resetCounter.mutate({ value });
      setCounter(result);
    } catch (error) {
      console.error('Failed to reset counter:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!counter) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Loading counter...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">
            🔢 Counter App
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Counter Display */}
          <div className="text-center">
            <div className="text-6xl font-bold text-indigo-600 mb-2">
              {counter.count}
            </div>
            <div className="text-sm text-gray-500">
              Last updated: {counter.updated_at.toLocaleTimeString()}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => handleDecrement(1)}
              disabled={isLoading}
              variant="outline"
              size="lg"
              className="h-12 text-lg font-semibold hover:bg-red-50 hover:border-red-300 hover:text-red-600"
            >
              ➖ -1
            </Button>
            <Button
              onClick={() => handleIncrement(1)}
              disabled={isLoading}
              variant="outline"
              size="lg"
              className="h-12 text-lg font-semibold hover:bg-green-50 hover:border-green-300 hover:text-green-600"
            >
              ➕ +1
            </Button>
          </div>

          {/* Large increment/decrement buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => handleDecrement(10)}
              disabled={isLoading}
              variant="outline"
              className="hover:bg-red-50 hover:border-red-300 hover:text-red-600"
            >
              -10
            </Button>
            <Button
              onClick={() => handleIncrement(10)}
              disabled={isLoading}
              variant="outline"
              className="hover:bg-green-50 hover:border-green-300 hover:text-green-600"
            >
              +10
            </Button>
          </div>

          {/* Reset Button */}
          <Button
            onClick={() => handleReset(0)}
            disabled={isLoading}
            variant="secondary"
            size="lg"
            className="w-full h-12 text-lg font-semibold bg-gray-100 hover:bg-gray-200"
          >
            🔄 Reset to 0
          </Button>

          {isLoading && (
            <div className="text-center text-sm text-gray-500">
              Updating counter...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
