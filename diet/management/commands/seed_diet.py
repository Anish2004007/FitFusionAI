from django.core.management.base import BaseCommand

from diet.models import Food, DietPlan


class Command(BaseCommand):

    help = "Seed initial FitFusion AI diet data"


    def handle(self, *args, **options):

        self.stdout.write(
            "Creating FitFusion AI diet data..."
        )


        # =================================================
        # CLEAR OLD SEEDED DATA
        # =================================================

        DietPlan.objects.all().delete()
        Food.objects.all().delete()


        # =================================================
        # FOODS
        # =================================================

        foods_data = [

            # -------------------------
            # PROTEINS
            # -------------------------

            {
                "name": "Grilled Chicken Breast",
                "category": "Protein",
                "calories": 165,
                "protein": 31,
                "carbohydrates": 0,
                "fats": 3.6,
                "serving_size": "100 g",
                "description": "Lean grilled chicken breast.",
            },

            {
                "name": "Boiled Eggs",
                "category": "Protein",
                "calories": 155,
                "protein": 13,
                "carbohydrates": 1.1,
                "fats": 11,
                "serving_size": "2 eggs",
                "description": "Boiled whole eggs.",
            },

            {
                "name": "Paneer",
                "category": "Protein",
                "calories": 265,
                "protein": 18,
                "carbohydrates": 6,
                "fats": 20,
                "serving_size": "100 g",
                "description": "Indian cottage cheese.",
            },

            {
                "name": "Greek Yogurt",
                "category": "Dairy",
                "calories": 100,
                "protein": 10,
                "carbohydrates": 4,
                "fats": 3,
                "serving_size": "150 g",
                "description": "High-protein Greek yogurt.",
            },

            {
                "name": "Dal",
                "category": "Protein",
                "calories": 170,
                "protein": 9,
                "carbohydrates": 25,
                "fats": 3,
                "serving_size": "1 bowl",
                "description": "Cooked lentils.",
            },


            # -------------------------
            # CARBOHYDRATES
            # -------------------------

            {
                "name": "Oats",
                "category": "Carbohydrate",
                "calories": 150,
                "protein": 5,
                "carbohydrates": 27,
                "fats": 3,
                "serving_size": "40 g",
                "description": "Whole grain oats.",
            },

            {
                "name": "Brown Rice",
                "category": "Carbohydrate",
                "calories": 215,
                "protein": 5,
                "carbohydrates": 45,
                "fats": 1.8,
                "serving_size": "1 cup cooked",
                "description": "Cooked brown rice.",
            },

            {
                "name": "Whole Wheat Roti",
                "category": "Carbohydrate",
                "calories": 120,
                "protein": 4,
                "carbohydrates": 20,
                "fats": 3,
                "serving_size": "1 roti",
                "description": "Whole wheat Indian flatbread.",
            },

            {
                "name": "Sweet Potato",
                "category": "Carbohydrate",
                "calories": 112,
                "protein": 2,
                "carbohydrates": 26,
                "fats": 0.1,
                "serving_size": "150 g",
                "description": "Baked sweet potato.",
            },


            # -------------------------
            # FRUITS
            # -------------------------

            {
                "name": "Banana",
                "category": "Fruit",
                "calories": 105,
                "protein": 1.3,
                "carbohydrates": 27,
                "fats": 0.3,
                "serving_size": "1 medium",
                "description": "Fresh banana.",
            },

            {
                "name": "Apple",
                "category": "Fruit",
                "calories": 95,
                "protein": 0.5,
                "carbohydrates": 25,
                "fats": 0.3,
                "serving_size": "1 medium",
                "description": "Fresh apple.",
            },

            {
                "name": "Orange",
                "category": "Fruit",
                "calories": 62,
                "protein": 1.2,
                "carbohydrates": 15,
                "fats": 0.2,
                "serving_size": "1 medium",
                "description": "Fresh orange.",
            },


            # -------------------------
            # VEGETABLES
            # -------------------------

            {
                "name": "Mixed Vegetables",
                "category": "Vegetable",
                "calories": 80,
                "protein": 3,
                "carbohydrates": 14,
                "fats": 1,
                "serving_size": "1 bowl",
                "description": "Mixed cooked seasonal vegetables.",
            },

            {
                "name": "Green Salad",
                "category": "Vegetable",
                "calories": 50,
                "protein": 2,
                "carbohydrates": 10,
                "fats": 0.5,
                "serving_size": "1 bowl",
                "description": "Fresh cucumber, tomato and lettuce salad.",
            },


            # -------------------------
            # HEALTHY FATS
            # -------------------------

            {
                "name": "Almonds",
                "category": "Healthy Fat",
                "calories": 164,
                "protein": 6,
                "carbohydrates": 6,
                "fats": 14,
                "serving_size": "28 g",
                "description": "Raw almonds.",
            },

            {
                "name": "Peanut Butter",
                "category": "Healthy Fat",
                "calories": 188,
                "protein": 8,
                "carbohydrates": 6,
                "fats": 16,
                "serving_size": "2 tbsp",
                "description": "Natural peanut butter.",
            },


            # -------------------------
            # SNACKS
            # -------------------------

            {
                "name": "Roasted Chickpeas",
                "category": "Snack",
                "calories": 160,
                "protein": 8,
                "carbohydrates": 27,
                "fats": 2.5,
                "serving_size": "40 g",
                "description": "Roasted chickpeas.",
            },

            {
                "name": "Protein Shake",
                "category": "Snack",
                "calories": 180,
                "protein": 25,
                "carbohydrates": 8,
                "fats": 4,
                "serving_size": "1 serving",
                "description": "Protein shake with milk or water.",
            },

        ]


        foods = {}


        for data in foods_data:

            food = Food.objects.create(
                **data
            )

            foods[data["name"]] = food


        # =================================================
        # DIET PLANS
        # =================================================

        plans = [

            # =================================================
            # LOSE WEIGHT
            # =================================================

            {
                "name": "Light Protein Breakfast",
                "goal": "Lose Weight",
                "meal_type": "Breakfast",
                "description": "A balanced high-protein breakfast.",
                "foods": [
                    "Oats",
                    "Boiled Eggs",
                    "Apple",
                ],
            },

            {
                "name": "Lean Chicken Lunch",
                "goal": "Lose Weight",
                "meal_type": "Lunch",
                "description": "Lean protein with vegetables and controlled carbohydrates.",
                "foods": [
                    "Grilled Chicken Breast",
                    "Brown Rice",
                    "Green Salad",
                ],
            },

            {
                "name": "Light Dinner",
                "goal": "Lose Weight",
                "meal_type": "Dinner",
                "description": "A light protein-rich dinner.",
                "foods": [
                    "Dal",
                    "Whole Wheat Roti",
                    "Mixed Vegetables",
                ],
            },

            {
                "name": "Healthy Snack",
                "goal": "Lose Weight",
                "meal_type": "Snack",
                "description": "A simple nutritious snack.",
                "foods": [
                    "Greek Yogurt",
                    "Orange",
                ],
            },


            # =================================================
            # GAIN MUSCLE
            # =================================================

            {
                "name": "Muscle Builder Breakfast",
                "goal": "Gain Muscle",
                "meal_type": "Breakfast",
                "description": "Protein-rich breakfast designed to support muscle growth.",
                "foods": [
                    "Oats",
                    "Boiled Eggs",
                    "Banana",
                    "Peanut Butter",
                ],
            },

            {
                "name": "High Protein Lunch",
                "goal": "Gain Muscle",
                "meal_type": "Lunch",
                "description": "High-protein lunch with quality carbohydrates.",
                "foods": [
                    "Grilled Chicken Breast",
                    "Brown Rice",
                    "Mixed Vegetables",
                ],
            },

            {
                "name": "Protein Dinner",
                "goal": "Gain Muscle",
                "meal_type": "Dinner",
                "description": "Protein-focused dinner for recovery.",
                "foods": [
                    "Paneer",
                    "Whole Wheat Roti",
                    "Green Salad",
                ],
            },

            {
                "name": "Muscle Recovery Snack",
                "goal": "Gain Muscle",
                "meal_type": "Snack",
                "description": "Protein-rich snack for post-workout recovery.",
                "foods": [
                    "Protein Shake",
                    "Banana",
                    "Almonds",
                ],
            },


            # =================================================
            # MAINTAIN WEIGHT
            # =================================================

            {
                "name": "Balanced Breakfast",
                "goal": "Maintain Weight",
                "meal_type": "Breakfast",
                "description": "Balanced breakfast for maintaining body weight.",
                "foods": [
                    "Oats",
                    "Boiled Eggs",
                    "Banana",
                ],
            },

            {
                "name": "Balanced Lunch",
                "goal": "Maintain Weight",
                "meal_type": "Lunch",
                "description": "Balanced meal with protein, carbohydrates and vegetables.",
                "foods": [
                    "Grilled Chicken Breast",
                    "Brown Rice",
                    "Green Salad",
                ],
            },

            {
                "name": "Balanced Dinner",
                "goal": "Maintain Weight",
                "meal_type": "Dinner",
                "description": "Balanced dinner with lean protein and vegetables.",
                "foods": [
                    "Dal",
                    "Whole Wheat Roti",
                    "Mixed Vegetables",
                ],
            },

            {
                "name": "Daily Healthy Snack",
                "goal": "Maintain Weight",
                "meal_type": "Snack",
                "description": "Simple healthy snack.",
                "foods": [
                    "Greek Yogurt",
                    "Apple",
                ],
            },


            # =================================================
            # IMPROVE FITNESS
            # =================================================

            {
                "name": "Fitness Breakfast",
                "goal": "Improve Fitness",
                "meal_type": "Breakfast",
                "description": "Balanced breakfast for an active lifestyle.",
                "foods": [
                    "Oats",
                    "Boiled Eggs",
                    "Orange",
                ],
            },

            {
                "name": "Fitness Lunch",
                "goal": "Improve Fitness",
                "meal_type": "Lunch",
                "description": "Balanced lunch supporting daily activity.",
                "foods": [
                    "Grilled Chicken Breast",
                    "Brown Rice",
                    "Mixed Vegetables",
                ],
            },

            {
                "name": "Fitness Dinner",
                "goal": "Improve Fitness",
                "meal_type": "Dinner",
                "description": "Nutritious dinner for recovery and fitness.",
                "foods": [
                    "Dal",
                    "Whole Wheat Roti",
                    "Green Salad",
                ],
            },

            {
                "name": "Fitness Snack",
                "goal": "Improve Fitness",
                "meal_type": "Snack",
                "description": "Light snack for sustained energy.",
                "foods": [
                    "Roasted Chickpeas",
                    "Apple",
                ],
            },

        ]


        for plan_data in plans:

            food_names = plan_data.pop(
                "foods"
            )

            plan = DietPlan.objects.create(
                **plan_data
            )


            for food_name in food_names:

                plan.foods.add(
                    foods[food_name]
                )


        self.stdout.write(
            self.style.SUCCESS(
                "Diet data created successfully."
            )
        )

        self.stdout.write(
            f"Foods created: {Food.objects.count()}"
        )

        self.stdout.write(
            f"Diet plans created: {DietPlan.objects.count()}"
        )