import { auth } from "@/auth";
import HomePage from "@/components/layout/homepage";

export default async function Home() {
  const session = await auth()
  console.log(">>check user path: / ", session);
  return (
    <div className="App">
      <HomePage />
    </div>
  );
}
