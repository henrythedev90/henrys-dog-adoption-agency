import dynamic from "next/dynamic";

export default dynamic(() => import("./Favorites"), { ssr: false });
