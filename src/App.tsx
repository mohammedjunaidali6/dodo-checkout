import Checkout from "./checkout/Checkout";
import Demo from "./demo/Demo";

function App() {
  const path = window.location.pathname;

  if (path === "/checkout") {
    const params = new URLSearchParams(window.location.search);

    const productId =
      params.get("productId") || "prod_pro";

    return <Checkout productId={productId} />;
  }

  return <Demo />;
}

export default App;