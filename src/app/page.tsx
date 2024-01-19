import { db } from "@/lib/db";
import Image from "next/image";

export default async function Home() {
  return (
    <h1 className="text-3xl font-bold text-blue-500 underline">Hello world!</h1>
  );
}
