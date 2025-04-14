import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import rootReducer from "./reducers/rootReducer";


const persistConfig = {
    key: "root",
    storage, // Using localStorage
    whitelist: ["auth"], // Persist only the auth reducer
  };

  const persistedReducer = persistReducer(persistConfig, rootReducer);
  const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          // Ignore serializability checks for actions like persist
          ignoredActions: ["persist/PERSIST"],
        },
      }),
  });
  

  const persistor = persistStore(store);

  export type AppDispatch = typeof store.dispatch;
  
  export { store, persistor };