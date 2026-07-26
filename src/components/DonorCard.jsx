import { Button, Card } from "@heroui/react";
import Image from "next/image";

export function DonorCard({ allBloods }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {allBloods.map((allBlood) => (
        <Card
          key={allBlood._id}
          className="flex h-full w-full flex-col items-stretch overflow-hidden"
        >
          <div className="relative h-[160px] w-full shrink-0 overflow-hidden rounded-t-2xl">
            <Image
              src="https://i.ibb.co/LXR28brz/Gemini-Generated-Image-qjg53tqjg53tqjg5.png"
              alt={allBlood.name || "Donor"}
              fill
              // className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>

          {/* ✅ NEW: বাইরের এই div-এ px-4 (left-right padding) যোগ করা
              হয়েছে — এটাই মূল ফিক্স। আগে Header/Footer-এর কোনো
              padding ছিল না, তাই টেক্সট card-এর edge ঘেঁষে/কেটে
              যাচ্ছিল। pb-4 যোগ করা হয়েছে যাতে card-এর নিচেও
              জায়গা থাকে */}
          <div className="flex flex-1 flex-col px-4 pb-4">
            {/* ✅ CHANGED: pt-4 যোগ (ছবির নিচে জায়গা), gap-1 -> gap-1.5
                সামান্য বেশি breathing room এর জন্য */}
            <Card.Header className="gap-1.5 pt-4">
              <Card.Title className="truncate text-lg">
                {allBlood.name}
              </Card.Title>
              <div>
                <p className="truncate text-sm text-default-500">
                  Location: {allBlood.location}
                </p>
              </div>
            </Card.Header>

            {/* ✅ CHANGED: mt-4 যোগ করা হয়েছে (Header আর Footer এর
                মধ্যে একটু ফাঁকা জায়গা, আগে গা ঘেঁষে ছিল) */}
            <Card.Footer className="mt-4 flex w-full flex-col items-start gap-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-foreground">
                  Last Donation Date:
                </span>
                <span className="text-sm text-default-600">
                  Mobile: {allBlood.mobile}
                </span>
              </div>

              <div className="flex w-full flex-col gap-2">
                <Button
                  variant="danger"
                  className="h-auto w-full items-center justify-center whitespace-normal py-2 text-center font-semibold"
                >
                  Blood Group: {allBlood.BloodGroup}
                </Button>
                <Button className="h-auto w-full py-2 font-semibold">
                  Favourite
                </Button>
              </div>
            </Card.Footer>
          </div>
        </Card>
      ))}
    </div>
  );
}
