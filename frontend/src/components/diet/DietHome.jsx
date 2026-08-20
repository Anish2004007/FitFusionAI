import { useEffect, useState } from "react";

import {
    getDiet,
    completeMeal,
} from "../../services/api";


function DietHome({
    onUserLoaded,
}) {

    const [diet, setDiet] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [updatingMeal, setUpdatingMeal] =
        useState(null);


    /* =========================================
       LOAD DIET
    ========================================= */

    useEffect(() => {

        const loadDiet = async () => {

            try {

                const data =
                    await getDiet();


                if (data.success) {

                    setDiet(data);


                    /*
                     * Keep navbar user information
                     * synchronized with Django.
                     */

                    if (
                        onUserLoaded &&
                        data.user
                    ) {

                        onUserLoaded(
                            data.user
                        );

                    }

                } else {

                    setError(
                        data.error ||
                        "Unable to load diet."
                    );

                }

            } catch (error) {

                console.error(error);

                setError(
                    "Unable to connect to Django."
                );

            } finally {

                setLoading(false);

            }

        };


        loadDiet();

    }, [onUserLoaded]);


    /* =========================================
       COMPLETE / UNCOMPLETE MEAL
    ========================================= */

    const handleMealComplete = async (
        mealId
    ) => {

        try {

            setUpdatingMeal(
                mealId
            );

            setError("");


            const data =
                await completeMeal(
                    mealId
                );


            if (!data.success) {

                setError(
                    data.error ||
                    "Unable to update meal."
                );

                return;

            }


            /*
             * Update the meal locally.
             */

            setDiet((previous) => {

                if (!previous) {

                    return previous;

                }


                const updatedMeals =
                    previous.meals.map(
                        (meal) => {

                            if (
                                meal.id ===
                                mealId
                            ) {

                                return {

                                    ...meal,

                                    completed:
                                        data.completed,

                                };

                            }

                            return meal;

                        }
                    );


                return {

                    ...previous,

                    meals:
                        updatedMeals,

                    diet_day: {

                        ...previous.diet_day,

                        completed:
                            data.diet_completed,

                    },

                };

            });


        } catch (error) {

            console.error(error);

            setError(
                "Unable to update meal."
            );

        } finally {

            setUpdatingMeal(null);

        }

    };


    /* =========================================
       LOADING
    ========================================= */

    if (loading) {

        return (

            <div className="diet-message">

                <div className="diet-message-icon">

                    <i className="bi bi-egg-fried"></i>

                </div>

                <h2>
                    Loading Your Diet...
                </h2>

                <p>
                    Preparing your personalized meals.
                </p>

            </div>

        );

    }


    /* =========================================
       ERROR
    ========================================= */

    if (error && !diet) {

        return (

            <div className="diet-message diet-error">

                <div className="diet-message-icon">

                    <i className="bi bi-exclamation-circle"></i>

                </div>

                <h2>
                    Unable to Load Diet
                </h2>

                <p>
                    {error}
                </p>

            </div>

        );

    }


    if (!diet) {

        return null;

    }


    /* =========================================
       DATA
    ========================================= */

    const meals =
        diet.meals || [];


    const nutrition =
        diet.nutrition || {};


    const calorieTarget =
        diet.diet_day?.calorie_target || 0;


    const calories =
        nutrition.calories || 0;


    const caloriePercentage =
        calorieTarget > 0
            ? Math.min(
                Math.round(
                    (
                        calories /
                        calorieTarget
                    ) * 100
                ),
                100
            )
            : 0;


    const completedMeals =
        meals.filter(
            (meal) =>
                meal.completed
        ).length;


    const totalMeals =
        meals.length;


    /* =========================================
       MEAL ICON
    ========================================= */

    const getMealIcon = (
        mealType
    ) => {

        if (
            mealType ===
            "Breakfast"
        ) {

            return "bi-sunrise-fill";

        }

        if (
            mealType ===
            "Lunch"
        ) {

            return "bi-brightness-high-fill";

        }

        if (
            mealType ===
            "Dinner"
        ) {

            return "bi-moon-stars-fill";

        }

        return "bi-apple";

    };


    /* =========================================
       PAGE
    ========================================= */

    return (

        <div className="diet-page">


            {/* =================================
                HEADER
            ================================= */}

            <div className="diet-header">

                <div>

                    <span className="diet-label">

                        <i className="bi bi-egg-fried"></i>

                        YOUR NUTRITION

                    </span>


                    <h1>
                        Today's Diet
                    </h1>


                    <p>
                        A personalized meal plan based
                        on your fitness goal.
                    </p>

                </div>

            </div>


            {/* =================================
                ERROR
            ================================= */}

            {error && (

                <div className="diet-inline-error">

                    <i className="bi bi-exclamation-circle"></i>

                    {error}

                </div>

            )}


            {/* =================================
                CALORIE OVERVIEW
            ================================= */}

            <div className="diet-overview">

                <div className="calorie-card">

                    <div className="calorie-icon">

                        <i className="bi bi-fire"></i>

                    </div>


                    <div className="calorie-content">

                        <span>
                            DAILY CALORIE TARGET
                        </span>

                        <h2>

                            {calorieTarget}

                            <small>
                                kcal
                            </small>

                        </h2>

                        <p>
                            Recommended daily intake
                        </p>

                    </div>


                    <div className="calorie-progress">

                        <div className="calorie-progress-header">

                            <span>
                                Today's planned nutrition
                            </span>

                            <strong>
                                {caloriePercentage}%
                            </strong>

                        </div>


                        <div className="calorie-track">

                            <div
                                className="calorie-fill"
                                style={{
                                    width:
                                        `${caloriePercentage}%`,
                                }}
                            ></div>

                        </div>


                        <span className="calorie-consumed">

                            {calories} kcal planned

                        </span>

                    </div>

                </div>


                {/* =================================
                    NUTRITION STATS
                ================================= */}

                <div className="nutrition-grid">


                    <div className="nutrition-card">

                        <div className="nutrition-icon protein">

                            <i className="bi bi-egg-fill"></i>

                        </div>

                        <span>
                            Protein
                        </span>

                        <strong>
                            {nutrition.protein || 0}
                            <small>g</small>
                        </strong>

                    </div>


                    <div className="nutrition-card">

                        <div className="nutrition-icon carbs">

                            <i className="bi bi-basket-fill"></i>

                        </div>

                        <span>
                            Carbohydrates
                        </span>

                        <strong>
                            {nutrition.carbohydrates || 0}
                            <small>g</small>
                        </strong>

                    </div>


                    <div className="nutrition-card">

                        <div className="nutrition-icon fats">

                            <i className="bi bi-droplet-fill"></i>

                        </div>

                        <span>
                            Fats
                        </span>

                        <strong>
                            {nutrition.fats || 0}
                            <small>g</small>
                        </strong>

                    </div>

                </div>

            </div>


            {/* =================================
                MEALS
            ================================= */}

            <div className="diet-meals-section">

                <div className="diet-section-heading">

                    <div>

                        <span>
                            TODAY'S MEAL PLAN
                        </span>

                        <h2>
                            Your Meals
                        </h2>

                    </div>


                    <div className="meal-count">

                        {completedMeals}
                        {" / "}
                        {totalMeals}

                        <span>
                            completed
                        </span>

                    </div>

                </div>


                <div className="diet-meals-grid">

                    {meals.map(
                        (meal) => (

                            <div
                                className={
                                    `diet-meal-card ${
                                        meal.completed
                                            ? "meal-completed"
                                            : ""
                                    }`
                                }
                                key={meal.id}
                            >


                                {/* =================
                                    MEAL HEADER
                                ================== */}

                                <div className="meal-card-header">

                                    <div className="meal-icon">

                                        <i
                                            className={
                                                `bi ${getMealIcon(
                                                    meal.meal_type
                                                )}`
                                            }
                                        ></i>

                                    </div>


                                    <div className="meal-title">

                                        <span>
                                            {meal.meal_type}
                                        </span>

                                        <h3>
                                            {meal.name}
                                        </h3>

                                    </div>


                                    {meal.completed && (

                                        <div className="meal-completed-badge">

                                            <i className="bi bi-check-circle-fill"></i>

                                            Completed

                                        </div>

                                    )}

                                </div>


                                {/* =================
                                    DESCRIPTION
                                ================== */}

                                {meal.description && (

                                    <p className="meal-description">

                                        {meal.description}

                                    </p>

                                )}


                                {/* =================
                                    NUTRITION
                                ================== */}

                                <div className="meal-nutrition">

                                    <div>

                                        <span>
                                            Calories
                                        </span>

                                        <strong>
                                            {meal.nutrition.calories}
                                            <small>
                                                kcal
                                            </small>
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Protein
                                        </span>

                                        <strong>
                                            {meal.nutrition.protein}
                                            <small>
                                                g
                                            </small>
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Carbs
                                        </span>

                                        <strong>
                                            {meal.nutrition.carbohydrates}
                                            <small>
                                                g
                                            </small>
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Fats
                                        </span>

                                        <strong>
                                            {meal.nutrition.fats}
                                            <small>
                                                g
                                            </small>
                                        </strong>

                                    </div>

                                </div>


                                {/* =================
                                    FOODS
                                ================== */}

                                <div className="meal-foods">

                                    <span className="foods-label">
                                        FOODS
                                    </span>


                                    <div className="food-list">

                                        {meal.foods.map(
                                            (food) => (

                                                <div
                                                    className="food-item"
                                                    key={food.id}
                                                >

                                                    <div>

                                                        <strong>
                                                            {food.name}
                                                        </strong>

                                                        <span>
                                                            {food.serving_size}
                                                        </span>

                                                    </div>


                                                    <span className="food-calories">

                                                        {food.calories}
                                                        {" "}kcal

                                                    </span>

                                                </div>

                                            )
                                        )}

                                    </div>

                                </div>


                                {/* =================
                                    COMPLETE BUTTON
                                ================== */}

                                <button
                                    type="button"
                                    className={
                                        meal.completed
                                            ? "meal-complete-btn completed"
                                            : "meal-complete-btn"
                                    }
                                    onClick={() =>
                                        handleMealComplete(
                                            meal.id
                                        )
                                    }
                                    disabled={
                                        updatingMeal ===
                                        meal.id
                                    }
                                >

                                    <i
                                        className={
                                            updatingMeal ===
                                            meal.id

                                                ? "bi bi-hourglass-split"

                                                : meal.completed

                                                    ? "bi bi-arrow-counterclockwise"

                                                    : "bi bi-check2-circle"
                                        }
                                    ></i>


                                    {updatingMeal ===
                                    meal.id

                                        ? "Updating..."

                                        : meal.completed

                                            ? "Mark as Incomplete"

                                            : "Mark Meal Complete"

                                    }

                                </button>

                            </div>

                        )
                    )}

                </div>

            </div>


            {/* =================================
                DAY COMPLETE
            ================================= */}

            {diet.diet_day?.completed && (

                <div className="diet-complete-card">

                    <div className="diet-complete-icon">

                        <i className="bi bi-check-lg"></i>

                    </div>


                    <div>

                        <span>
                            DAILY GOAL COMPLETE
                        </span>

                        <h2>
                            Great work! You completed
                            today's meal plan.
                        </h2>

                        <p>
                            Keep following your nutrition
                            plan to stay on track.
                        </p>

                    </div>

                </div>

            )}

        </div>

    );

}


export default DietHome;