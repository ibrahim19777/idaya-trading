import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Zap, TrendingUp, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

interface AIStrategy {
  name: string;
  description: string;
  riskLevel: 'conservative' | 'moderate' | 'aggressive';
  minConfidence: number;
  maxRiskPerTrade: number;
  targetPairs: string[];
  indicators: string[];
}

interface AISignal {
  symbol: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  quantity: number;
  reasoning: string[];
  aiModel: string;
  riskScore: number;
  timestamp: Date;
}

export default function AITrading() {
  const [selectedStrategy, setSelectedStrategy] = useState<string>('');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BTC/USDT');
  const [currentSignal, setCurrentSignal] = useState<AISignal | null>(null);
  const { toast } = useToast();

  // Fetch AI strategies
  const { data: strategies, isLoading: strategiesLoading } = useQuery({
    queryKey: ['/api/ai/strategies'],
  });

  // Generate AI signal mutation
  const generateSignalMutation = useMutation({
    mutationFn: async ({ symbol, strategyName }: { symbol: string; strategyName: string }) => {
      const response = await apiRequest('POST', '/api/ai/generate-signal', {
        symbol,
        strategyName
      });
      return response.json();
    },
    onSuccess: (signal) => {
      if (signal) {
        setCurrentSignal(signal);
        toast({
          title: "AI Signal Generated! 🎯",
          description: `${signal.aiModel} suggests ${signal.action} for ${signal.symbol} with ${Math.round(signal.confidence * 100)}% confidence`
        });
      } else {
        toast({
          title: "No Signal Generated",
          description: "Market conditions don't meet strategy requirements",
          variant: "destructive"
        });
      }
    }
  });

  // Execute AI trade mutation
  const executeTradeMutation = useMutation({
    mutationFn: async (signal: AISignal) => {
      const response = await apiRequest('POST', '/api/ai/execute-trade', {
        signal,
        platformId: 1 // Default platform
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "AI Trade Executed! 🚀",
        description: "Your AI trading strategy has been executed successfully"
      });
      setCurrentSignal(null);
    },
    onError: () => {
      toast({
        title: "Trade Failed",
        description: "Unable to execute AI trade. Please check your platform connection.",
        variant: "destructive"
      });
    }
  });

  const handleGenerateSignal = () => {
    if (!selectedStrategy || !selectedSymbol) {
      toast({
        title: "Missing Information",
        description: "Please select both strategy and trading pair",
        variant: "destructive"
      });
      return;
    }
    
    generateSignalMutation.mutate({
      symbol: selectedSymbol,
      strategyName: selectedStrategy
    });
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'conservative': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'aggressive': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'BUY': return 'text-green-600 dark:text-green-400';
      case 'SELL': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* خلفية تأثيرات بصرية */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full blur-3xl translate-x-48 -translate-y-48"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-cyan-500/20 rounded-full blur-3xl -translate-x-48 translate-y-48"></div>
        
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 space-y-8 relative">
          {/* عنوان عصري مع تأثيرات */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div className="flex items-center justify-center space-x-4 mb-4">
                <div className="relative p-4 bg-gradient-to-br from-purple-100 to-indigo-200 dark:from-purple-900/50 dark:to-indigo-800/50 rounded-2xl shadow-lg backdrop-blur-sm border border-white/20 dark:border-gray-700/20">
                  <Brain className="h-12 w-12 text-purple-600 dark:text-purple-400 animate-pulse" />
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-bounce flex items-center justify-center">
                    <Zap className="h-3 w-3 text-white" />
                  </div>
                </div>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 dark:from-purple-400 dark:via-blue-400 dark:to-indigo-400 bg-clip-text text-transparent mb-4">
                محرك التداول الذكي
              </h1>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"></div>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300 mt-6 backdrop-blur-sm bg-white/30 dark:bg-gray-800/30 rounded-2xl px-8 py-4 inline-block shadow-lg border border-white/20 dark:border-gray-700/20">
              🤖 خوارزmiات متقدمة لاتخاذ قرارات تداول ذكية
            </p>
          </div>

      <Tabs defaultValue="strategies" className="space-y-8">
        <TabsList className="grid w-full grid-cols-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 shadow-xl rounded-2xl p-1">
          <TabsTrigger value="strategies" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white rounded-xl transition-all duration-300 font-semibold">
            🎯 استراتيجيات الذكاء الاصطناعي
          </TabsTrigger>
          <TabsTrigger value="signals" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white rounded-xl transition-all duration-300 font-semibold">
            ⚡ توليد الإشارات
          </TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white rounded-xl transition-all duration-300 font-semibold">
            📊 الأداء
          </TabsTrigger>
        </TabsList>

        <TabsContent value="strategies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Available AI Strategies</span>
              </CardTitle>
              <CardDescription>
                Choose from our advanced AI-powered trading strategies
              </CardDescription>
            </CardHeader>
            <CardContent>
              {strategiesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {strategies?.map((strategy: AIStrategy) => (
                    <Card key={strategy.name} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{strategy.name}</CardTitle>
                          <Badge className={getRiskLevelColor(strategy.riskLevel)}>
                            {strategy.riskLevel}
                          </Badge>
                        </div>
                        <CardDescription className="text-sm">
                          {strategy.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Min Confidence:</span>
                            <span className="font-medium">{Math.round(strategy.minConfidence * 100)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Max Risk/Trade:</span>
                            <span className="font-medium">{Math.round(strategy.maxRiskPerTrade * 100)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Target Pairs:</span>
                            <span className="font-medium">{strategy.targetPairs.length}</span>
                          </div>
                          <div className="mt-3">
                            <span className="text-gray-600 dark:text-gray-400 text-xs">Indicators:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {strategy.indicators.map((indicator) => (
                                <Badge key={indicator} variant="outline" className="text-xs">
                                  {indicator}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="signals" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Signal Generator</span>
                </CardTitle>
                <CardDescription>
                  Generate AI-powered trading signals
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="strategy">AI Strategy</Label>
                  <Select value={selectedStrategy} onValueChange={setSelectedStrategy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select AI strategy" />
                    </SelectTrigger>
                    <SelectContent position="popper" sideOffset={5} align="start">
                      {strategies?.map((strategy: AIStrategy) => (
                        <SelectItem key={strategy.name} value={strategy.name}>
                          {strategy.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="symbol">Trading Pair</Label>
                  <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select trading pair" />
                    </SelectTrigger>
                    <SelectContent position="popper" sideOffset={5} align="start">
                      <SelectItem value="BTC/USDT">BTC/USDT</SelectItem>
                      <SelectItem value="ETH/USDT">ETH/USDT</SelectItem>
                      <SelectItem value="ADA/USDT">ADA/USDT</SelectItem>
                      <SelectItem value="SOL/USDT">SOL/USDT</SelectItem>
                      <SelectItem value="DOGE/USDT">DOGE/USDT</SelectItem>
                      <SelectItem value="EUR/USD">EUR/USD</SelectItem>
                      <SelectItem value="GBP/USD">GBP/USD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleGenerateSignal}
                  disabled={generateSignalMutation.isPending}
                  className="w-full"
                >
                  {generateSignalMutation.isPending ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      <span>Analyzing Market...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Brain className="h-4 w-4" />
                      <span>Generate AI Signal</span>
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>

            {currentSignal && (
              <Card className="border-l-4 border-l-primary">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>AI Signal Generated</span>
                    </div>
                    <Badge className={getActionColor(currentSignal.action)}>
                      {currentSignal.action}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {currentSignal.aiModel} • {new Date(currentSignal.timestamp).toLocaleTimeString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Symbol:</span>
                      <p className="font-medium">{currentSignal.symbol}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Confidence:</span>
                      <p className="font-medium">{Math.round(currentSignal.confidence * 100)}%</p>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Entry Price:</span>
                      <p className="font-medium">${currentSignal.entryPrice.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Quantity:</span>
                      <p className="font-medium">{currentSignal.quantity}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Stop Loss:</span>
                      <p className="font-medium text-red-600">${currentSignal.stopLoss.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Take Profit:</span>
                      <p className="font-medium text-green-600">${currentSignal.takeProfit.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">AI Reasoning:</span>
                    <div className="space-y-1">
                      {currentSignal.reasoning.map((reason, index) => (
                        <div key={index} className="flex items-start space-x-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <span className="text-sm text-amber-600 dark:text-amber-400">
                      Risk Score: {Math.round(currentSignal.riskScore * 100)}%
                    </span>
                  </div>

                  <Button 
                    onClick={() => executeTradeMutation.mutate(currentSignal)}
                    disabled={executeTradeMutation.isPending}
                    className="w-full"
                    variant={currentSignal.action === 'BUY' ? 'default' : 'destructive'}
                  >
                    {executeTradeMutation.isPending ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                        <span>Executing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4" />
                        <span>Execute AI Trade</span>
                      </div>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Performance Analytics</CardTitle>
              <CardDescription>
                Track the performance of AI trading strategies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">87.4%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">342</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Signals</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">+24.8%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Monthly Return</div>
                </div>
              </div>
              
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Detailed performance analytics coming soon!</p>
                <p className="text-sm">Connect your trading accounts to see live performance data</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
        </main>
      </div>
    </div>
  );
}