<template>
  <Teleport to="body">
    <div v-if="isVisible" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50" @click="close">
      <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden" @click.stop>
        <!-- Header -->
        <div class="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                🤖
              </div>
              <div>
                <h3 class="font-bold">AI Insights</h3>
                <p class="text-sm opacity-90">Personalized for you</p>
              </div>
            </div>
            <button @click="close" class="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors">
              ✕
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="p-4 space-y-4 overflow-y-auto max-h-96">
          <!-- Current Analysis -->
          <div v-if="currentAnalysis" class="space-y-3">
            <div class="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg">
              <h4 class="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <span>🎯</span>
                Why This Matches You
              </h4>
              <p class="text-sm text-gray-700">{{ currentAnalysis.personalizedReason }}</p>
              <div class="mt-2 flex items-center gap-2">
                <div class="bg-white px-2 py-1 rounded-full text-xs font-semibold text-purple-600">
                  {{ Math.round(currentAnalysis.confidence * 100) }}% Match
                </div>
              </div>
            </div>

            <!-- Key Insights -->
            <div v-if="currentAnalysis.insights?.length" class="space-y-2">
              <h4 class="font-semibold text-gray-800 flex items-center gap-2">
                <span>💡</span>
                Key Insights
              </h4>
              <div class="space-y-2">
                <div v-for="insight in currentAnalysis.insights" :key="insight.type" 
                     class="bg-gray-50 p-3 rounded-lg">
                  <div class="flex items-center gap-2 mb-1">
                    <span>{{ getInsightIcon(insight.type) }}</span>
                    <span class="font-medium text-gray-800">{{ insight.title }}</span>
                  </div>
                  <p class="text-sm text-gray-600">{{ insight.description }}</p>
                </div>
              </div>
            </div>

            <!-- Behavioral Patterns -->
            <div v-if="behaviorInsights?.length" class="space-y-2">
              <h4 class="font-semibold text-gray-800 flex items-center gap-2">
                <span>📊</span>
                Your Patterns
              </h4>
              <div class="space-y-2">
                <div v-for="pattern in behaviorInsights" :key="pattern.type"
                     class="bg-gradient-to-r from-green-50 to-blue-50 p-3 rounded-lg">
                  <div class="flex items-center justify-between mb-1">
                    <span class="font-medium text-gray-800">{{ pattern.label }}</span>
                    <span class="text-sm text-gray-600">{{ pattern.frequency }}</span>
                  </div>
                  <p class="text-xs text-gray-600">{{ pattern.insight }}</p>
                </div>
              </div>
            </div>

            <!-- Smart Recommendations -->
            <div v-if="smartRecommendations?.length" class="space-y-2">
              <h4 class="font-semibold text-gray-800 flex items-center gap-2">
                <span>🚀</span>
                Smart Recommendations
              </h4>
              <div class="space-y-2">
                <div v-for="rec in smartRecommendations" :key="rec.id"
                     class="bg-gradient-to-r from-yellow-50 to-orange-50 p-3 rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                     @click="applyRecommendation(rec)">
                  <div class="flex items-center justify-between mb-1">
                    <span class="font-medium text-gray-800">{{ rec.title }}</span>
                    <span class="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded-full">
                      {{ rec.priority }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-600 mb-2">{{ rec.description }}</p>
                  <div class="flex items-center gap-2">
                    <span class="text-xs text-gray-500">Expected benefit:</span>
                    <span class="text-xs font-semibold text-green-600">{{ rec.expectedBenefit }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Market Intelligence -->
            <div v-if="marketIntelligence" class="space-y-2">
              <h4 class="font-semibold text-gray-800 flex items-center gap-2">
                <span>📈</span>
                Market Intelligence
              </h4>
              <div class="bg-gradient-to-r from-indigo-50 to-blue-50 p-3 rounded-lg">
                <div class="grid grid-cols-2 gap-4 mb-3">
                  <div class="text-center">
                    <div class="text-lg font-bold text-indigo-600">{{ marketIntelligence.trendScore }}%</div>
                    <div class="text-xs text-gray-600">Trend Score</div>
                  </div>
                  <div class="text-center">
                    <div class="text-lg font-bold text-green-600">{{ marketIntelligence.demandLevel }}</div>
                    <div class="text-xs text-gray-600">Demand</div>
                  </div>
                </div>
                <p class="text-sm text-gray-700">{{ marketIntelligence.summary }}</p>
              </div>
            </div>
          </div>

          <!-- Loading State -->
          <div v-else class="flex items-center justify-center py-8">
            <div class="text-center">
              <div class="animate-spin text-4xl mb-2">🤖</div>
              <p class="text-gray-600">Analyzing your preferences...</p>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="border-t p-4 space-y-2">
          <div class="flex gap-2">
            <button @click="refreshInsights" 
                    class="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-4 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2">
              <span>🔄</span>
              Refresh Insights
            </button>
            <button @click="saveInsights"
                    class="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
              💾
            </button>
          </div>
          
          <!-- Feedback -->
          <div class="flex items-center justify-center gap-4 text-sm">
            <span class="text-gray-600">Was this helpful?</span>
            <button @click="provideFeedback('helpful')" class="text-green-600 hover:text-green-700">👍</button>
            <button @click="provideFeedback('not-helpful')" class="text-red-600 hover:text-red-700">👎</button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
interface AIInsight {
  type: 'price' | 'trend' | 'quality' | 'timing' | 'similar'
  title: string
  description: string
}

interface BehaviorInsight {
  type: string
  label: string
  frequency: string
  insight: string
}

interface SmartRecommendation {
  id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  expectedBenefit: string
  action: string
}

interface MarketIntelligence {
  trendScore: number
  demandLevel: 'Low' | 'Medium' | 'High' | 'Very High'
  summary: string
}

interface AIAnalysis {
  personalizedReason: string
  confidence: number
  insights: AIInsight[]
}

interface Props {
  isVisible: boolean
  currentAnalysis?: AIAnalysis
  behaviorInsights?: BehaviorInsight[]
  smartRecommendations?: SmartRecommendation[]
  marketIntelligence?: MarketIntelligence
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  refresh: []
  save: [analysis: AIAnalysis]
  feedback: [type: 'helpful' | 'not-helpful']
  applyRecommendation: [recommendation: SmartRecommendation]
}>()

const close = () => {
  emit('close')
}

const refreshInsights = () => {
  emit('refresh')
}

const saveInsights = () => {
  if (props.currentAnalysis) {
    emit('save', props.currentAnalysis)
  }
}

const provideFeedback = (type: 'helpful' | 'not-helpful') => {
  emit('feedback', type)
}

const applyRecommendation = (recommendation: SmartRecommendation) => {
  emit('applyRecommendation', recommendation)
}

const getInsightIcon = (type: string): string => {
  const icons = {
    price: '💰',
    trend: '📈',
    quality: '⭐',
    timing: '⏰',
    similar: '🔗'
  }
  return icons[type as keyof typeof icons] || '💡'
}
</script>
