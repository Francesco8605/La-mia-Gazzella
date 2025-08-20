import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface NutritionalSummaryProps {
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  bmi?: number;
  idealWeight?: number;
  weightGoal?: number;
  healthStatus?: string;
}

export function NutritionalSummary({
  targetCalories,
  targetProtein,
  targetCarbs,
  targetFat,
  bmi,
  idealWeight,
  weightGoal,
  healthStatus,
}: NutritionalSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card className="bg-gradient-to-br from-white/60 to-white/30 backdrop-blur-md border-white/20 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Calorie Giornaliere
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent">
            {targetCalories}
          </div>
          <p className="text-xs text-gray-500 mt-1">kcal/giorno</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-white/60 to-white/30 backdrop-blur-md border-white/20 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Proteine
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            {targetProtein}g
          </div>
          <p className="text-xs text-gray-500 mt-1">25% calorie</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-white/60 to-white/30 backdrop-blur-md border-white/20 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Carboidrati
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent">
            {targetCarbs}g
          </div>
          <p className="text-xs text-gray-500 mt-1">45% calorie</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-white/60 to-white/30 backdrop-blur-md border-white/20 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Grassi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
            {targetFat}g
          </div>
          <p className="text-xs text-gray-500 mt-1">30% calorie</p>
        </CardContent>
      </Card>

      {bmi && (
        <Card className="bg-gradient-to-br from-white/60 to-white/30 backdrop-blur-md border-white/20 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              BMI Attuale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              {bmi}
            </div>
            <p className="text-xs text-gray-500 mt-1">{healthStatus}</p>
          </CardContent>
        </Card>
      )}

      {idealWeight && (
        <Card className="bg-gradient-to-br from-white/60 to-white/30 backdrop-blur-md border-white/20 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Peso Forma
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-to-r from-teal-500 to-green-500 bg-clip-text text-transparent">
              {idealWeight}kg
            </div>
            <p className="text-xs text-gray-500 mt-1">BMI 22</p>
          </CardContent>
        </Card>
      )}

      {weightGoal && (
        <Card className="bg-gradient-to-br from-white/60 to-white/30 backdrop-blur-md border-white/20 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Obiettivo Peso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-blue-500 bg-clip-text text-transparent">
              {weightGoal}kg
            </div>
            <p className="text-xs text-gray-500 mt-1">Target</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}