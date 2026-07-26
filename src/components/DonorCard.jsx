import { Button, Card } from "@heroui/react";
import Image from "next/image";

export function DonorCard({ allBloods }) {
  return (
    // ✅ CHANGED: single column এর বদলে responsive grid করা হয়েছে
    // মোবাইলে ১ কলাম, ট্যাবলেটে ২ কলাম, বড় স্ক্রিনে ৩ কলাম
    // আগে: "grid-cols-1" (সবসময় ১ কলাম, বড় স্ক্রিনে ফাঁকা জায়গা নষ্ট হতো)
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {allBloods.map((allBlood) => (
        // ✅ CHANGED: key শুধু div-এ না রেখে বাইরে রাখা হয়েছে (ভালো practice)
        <Card
          key={allBlood._id}
          // ✅ CHANGED: "md:flex-row" বাদ দেওয়া হয়েছে কারণ এখন grid-এ
          // প্রতিটা কার্ড একটা বক্সের মধ্যে থাকবে, তাই ভেতরে সবসময়
          // column (উপর-নিচ) layout রাখা হয়েছে — এতে গ্রিডে সব কার্ড
          // সমান দেখাবে এবং কনটেন্ট বেশি হলেও ভাঙবে না
          className="flex h-full w-full flex-col overflow-hidden"
        >
          {/* ✅ CHANGED: ফিক্সড height/width বাদ দিয়ে responsive height
              w-full ব্যবহার করা হয়েছে, image যেন card-এর প্রস্থ অনুযায়ী
              বসে (আগে ছিল sm:w-[120px] যেটা ছোট স্ক্রিনে ভালো লাগলেও
              বড় স্ক্রিনে অস্বাভাবিক দেখাচ্ছিল কারণ flex-row ছিল) */}
          <div className="relative h-[160px] w-full shrink-0 overflow-hidden">
            {/* ✅ CHANGED: fixed width/height (250x250) বাদ দিয়ে
                "fill" prop ব্যবহার করা হয়েছে — parent div যত বড়/ছোট
                হবে, image সেই অনুযায়ী পুরো জায়গা fill করবে
                (fill props ব্যবহার করলে next/image নিজেই responsive
                হয়ে যায়, তাই আলাদা width/height দেওয়ার দরকার নেই) */}
            <Image
              src="https://i.ibb.co/LXR28brz/Gemini-Generated-Image-qjg53tqjg53tqjg5.png"
              alt={allBlood.name || "Donor"}
              fill
              // ✅ NEW: object-cover যোগ করা হয়েছে যাতে ছবি
              // বিকৃত (stretched) না হয়ে সুন্দরভাবে crop হয়ে বসে
              className="object-cover"
              // ✅ NEW: sizes prop যোগ করা হয়েছে performance-এর জন্য
              // (next/image কে বলে দেয় বিভিন্ন স্ক্রিনে ছবি কত বড় দেখাবে,
              // এতে সঠিক সাইজের ছবি লোড হয়ে page দ্রুত লোড হয়)
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>

          <div className="flex flex-1 flex-col p-4">
            <Card.Header className="gap-1 p-0 pb-2">
              {/* ✅ CHANGED: "pr-8" বাদ দেওয়া হয়েছে (আগে হয়তো close
                  button-এর জন্য জায়গা রাখা হতো, কিন্তু এখানে
                  CloseButton ব্যবহার হচ্ছে না, তাই দরকার নেই) */}
              {/* ✅ NEW: truncate যোগ করা হয়েছে যাতে বড় নাম হলে
                  card এর বাইরে চলে না যায়, বরং "..." দেখাবে */}
              <Card.Title className="truncate">{allBlood.name}</Card.Title>
              <div>
                {/* ✅ NEW: truncate + text-sm text-muted-foreground
                    যোগ করা হয়েছে যাতে লম্বা location টেক্সট
                    ভেঙে card এর shape নষ্ট না করে */}
                <p className="truncate text-sm text-muted-foreground">
                  Location: {allBlood.location}
                </p>
              </div>
            </Card.Header>

            {/* ✅ CHANGED: "flex-row" justify-between বাদ দিয়ে
                সবসময় column layout করা হয়েছে (mt-auto রেখে দেওয়া
                হয়েছে যাতে footer সবসময় card-এর নিচে stick করে,
                কার্ডের content কম-বেশি হলেও সবগুলো card একই height
                বজায় রাখে grid-এ) */}
            <Card.Footer className="mt-auto flex w-full flex-col items-start gap-3 p-0 pt-3">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">
                  Last Donation Date:
                </span>
                <span className="text-sm">Mobile: {allBlood.mobile}</span>
              </div>

              {/* ✅ CHANGED: button দুটোকে "flex-col sm:flex-row" করা
                  হয়েছে — ছোট স্ক্রিনে (grid-এর প্রতিটা কার্ড যেহেতু
                  এখন narrow হতে পারে) button উপর-নিচ বসবে, বড়
                  স্ক্রিনে পাশাপাশি বসবে, যাতে জায়গা নষ্ট না হয় */}
              <div className="flex w-full flex-col gap-2 sm:flex-row">
                <Button variant="danger" className="w-full sm:w-auto">
                  Blood Group: {allBlood.BloodGroup}
                </Button>
                <Button className="w-full sm:w-auto">Favourite</Button>
              </div>
            </Card.Footer>
          </div>
        </Card>
      ))}
    </div>
  );
}
