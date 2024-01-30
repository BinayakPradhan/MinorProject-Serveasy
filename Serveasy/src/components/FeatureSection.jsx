// import React from 'react'
import ProductCard from "./ProductCard";
import { data } from "../constants";
const FeatureSection = () => {
  return (
    <div className="container pt-16">
      <div className="lg:flex justify-between items-center">
        <div>
          <h3 className="font-medium text-2xl">Most Selling Foods:</h3>
          <p className="text-gray-600 mt-2">
            Most trending meals in the market.
          </p>
        </div>
        <div className="space-x-4 mt-8 lg:mt-0">
          <button className="feature_btn">Breakfast</button>
          <button className="text-gray-600 hover:text-secondary">Lunch</button>
          <button className="text-gray-600 hover:text-secondary">Dinner</button>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 pt-8 gap-2">
        <div>
          <img
            src="data:image/png;base64,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"
            alt="banner"
            className="w-full h-full object-cover"
          />
        </div>
        {data.map((el) => (
          <ProductCard
            key={el.id}
            img={el.food_image_url}
            name={el.meal_name}
            price={el.price}
          />
        ))}
      </div>
    </div>
  );
};

export default FeatureSection;