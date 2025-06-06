import dynamic from "next/dynamic";

export default dynamic(() => import("./SuggestedDogs"), { ssr: false });
