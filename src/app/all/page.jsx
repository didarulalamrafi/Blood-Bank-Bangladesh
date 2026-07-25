import { DonorCard } from "@/components/DonorCard";

const AllBloodPage = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/all`, {
    cache: "no-store",
  });
  const allBloods = await res.json();
  // if (allBlood.length === 0) {
  //   return (
  //     <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
  //       <h2 className="text-3xl font-bold"> No data found</h2>
  //     </div>
  //   );
  // }
  // console.log(allBloods);
  return (
    <div>
      <h1 className="text-center text-4xl font-bold text-red-600">All Blood</h1>
      <div className="w-4/12 mx-auto my-6">
        <DonorCard allBloods={allBloods} />
      </div>
    </div>
  );
};

export default AllBloodPage;
