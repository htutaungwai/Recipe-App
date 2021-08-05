const mealsEl= document.getElementById('meals');
const favouriteContainer = document.getElementById('favouriteContainer');
let currentMealId;
const mealPopup = document.getElementById("meal-popup");
const popupCloseBtn = document.getElementById("close-popup");
const searchTerm = document.getElementById("search-term");
const searchBtn = document.getElementById("search");
const mealInfoEl = document.getElementById("meal-info");

fetchFavMeals();
getRandomMeal();

async function getRandomMeal(){
    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
    const respData = await resp.json();
    const randomMeal = respData.meals[0];
    addMeal(randomMeal, true);
    currentMealId = randomMeal.idMeal;
}

function addMeal(mealData, random = false){
    const meal = document.createElement('div');
    meal.classList.add("meal");
    meal.innerHTML = `
    <div class="meal-header">
            ${random ? `<span class="random">
            Random Recipe
            </span>` : ''}

        <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
    </div>
    <div class="meal-body">
        <h4>${mealData.strMeal}</h4>
        <button class="fav-btn"><i class="fas fa-heart"></i></button>
    </div>
`;
    const btn = meal.querySelector(".meal-body .fav-btn");
    btn.addEventListener('click', (e) => {
        if(btn.classList.contains("active")){
            removeMealLS(mealData.idMeal)
            btn.classList.remove("active");
        }else{
            addMealLS(mealData.idMeal);
            btn.classList.add("active");
        }
        favouriteContainer.innerHTML = '';
        fetchFavMeals();
    })
    meal.addEventListener('click', () => {
        showMealInfo(mealData);
    })
    meals.appendChild(meal);
}

async function getMealById(id){
    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i=' + id);
    const respData = await resp.json();
    const meal = respData.meals[0];
    return meal;
}

async function getMealBySearch(term){
    const resp = await fetch("https://www.themealdb.com/api/json/v1/1/search.php?s=" + term);
    const respData = await resp.json();
    const meals = await respData.meals;
    return meals;
}

function addMealLS(mealId){
    // this function adds selected IDs to localstorage.
    const mealIds = getMealLS();
    localStorage.setItem('mealIds', JSON.stringify([...mealIds, mealId]));
};

function removeMealLS(mealId){
    // this function removes unwanted IDs from localstorage.
    const mealIds = getMealLS();
    localStorage.setItem("mealIds", JSON.stringify(mealIds.filter(id => id !== mealId)));
}
function getMealLS(){
    // this function returns IDs from localstorage.
    const mealIds = JSON.parse(localStorage.getItem('mealIds'));
    return mealIds === null ? [] : mealIds;
};

async function fetchFavMeals(){
    // this function fetches meals from local storage and add to fav-container
    favouriteContainer.innerHTML = '';
    const mealIds = getMealLS();
    for (let i=0; i<mealIds.length; i++){
        const mealId = mealIds[i];
        meal = await getMealById(mealId);
        addMealToFav(meal);
    }
}

function addMealToFav(mealData){
    // this creates <li> elements for random and searched meals.
    
    const favMeal = document.createElement('li');
    favMeal.innerHTML = `
        <img src="${mealData.strMealThumb}"
        alt="${mealData.strMeal}"/>
        <span>${mealData.strMeal}</span>
        <button class="clear"><i class="fas fa-times"></i></button>
`;
    const btn = favMeal.querySelector(".clear");
    btn.addEventListener('click', () => {
        removeMealLS(mealData.idMeal);
        checkFav(mealData.idMeal);
        fetchFavMeals();
    });
    favMeal.addEventListener('click', ()=> {
        showMealInfo(mealData);
    });
    favouriteContainer.appendChild(favMeal);
}

function checkFav(mealId){
    // thsi function checks if selected items to deleted are hearted or not.
    // If hearted, it toggles their classlist ("active");
    if(mealId === currentMealId){
        const btn = document.querySelector(".fav-btn");
        btn.classList.toggle("active");
    }
}

function showMealInfo(mealData){
    // clean it up
    mealInfoEl.innerHTML = '';
    console.log(mealData["strMeasure1"])
    const ingredients = [];
    for(let i=1; i<20; i++){
        if(mealData['strIngredient' + i]){
         ingredients.push(`${mealData['strIngredient' + i]} / ${mealData['strMeasure' + i]}`);
        } else{
            console.log('not ok');
            break;
        }
    }
    console.log(ingredients)
    const mealEl = document.createElement("div");
    mealEl.innerHTML = `
    <h1>${mealData.strMeal}</h1>
        <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
            <p>${mealData.strInstructions}</p>
        <h3>Ingredients</h3>
        <ul>
         ${ingredients.map(ing => `<li>${ing}</li>`).join('')}
        </u>
            
    `
    
    mealInfoEl.appendChild(mealEl);
    // show the popup
    mealPopup.classList.remove('hidden');
}

searchBtn.addEventListener('click', async () => {
    // clean the container
    mealsEl.innerHTML = "";
    const search = searchTerm.value;
    const meals = await getMealBySearch(search);
    if(meals)
        meals.forEach(meal => {
        addMeal(meal);
    });
});

popupCloseBtn.addEventListener("click", () => {
    mealPopup.classList.add('hidden');
})