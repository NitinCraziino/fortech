import { combineReducers } from "redux";
import authReducer from "../redux/slices/authSlice";
import customerReducer from "../redux/slices/customerSlice";
import productReducer from "../redux/slices/productSlice";
import orderReducer from "../redux/slices/orderSlice";

const appReducer = combineReducers({
  auth: authReducer,
  customer: customerReducer,
  product: productReducer,
  order: orderReducer
});

const rootReducer = (state, action) => {
  if (action.type === "auth/logout") {
    state = undefined; // Reset all slices to their initial state
  }
  return appReducer(state, action);
};

export default rootReducer;