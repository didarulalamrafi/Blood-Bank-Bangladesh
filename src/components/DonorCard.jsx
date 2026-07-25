import { Button, Card, CloseButton } from "@heroui/react";
import Image from "next/image";

export function DonorCard({ allBloods }) {
  console.log(allBloods);
  return (
    <div className="grid grid-cols-1 gap-4">
      {allBloods.map((allBlood) => (
        <div key={allBlood._id}>
          <Card className="w-full items-stretch md:flex-row">
            <div className="relative h-[140px] w-full shrink-0 overflow-hidden rounded-2xl sm:h-[120px] sm:w-[120px]">
              <Image
                src="https://i.ibb.co/LXR28brz/Gemini-Generated-Image-qjg53tqjg53tqjg5.png"
                alt="Logo"
                width={250}
                height={250}
              ></Image>
              {/* className="pointer-events-none absolute inset-0 h-full w-full scale-125 object-cover select-none" */}
            </div>
            <div className="flex flex-1 flex-col">
              <Card.Header className="gap-1">
                <Card.Title className="pr-8">{allBlood.name}</Card.Title>
                <div>
                  <p>Location: {allBlood.location}</p>
                </div>
              </Card.Header>
              <Card.Footer className="mt-auto flex w-full flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">
                    Last Donation Date:
                  </span>
                  <span className="text-sm">Mobile: {allBlood.mobile}</span>
                </div>
                <div className="flex flex-col gap-3">
                  <Button variant="danger" className="w-full sm:w-auto">
                    Blood Group: {allBlood.BloodGroup}
                  </Button>
                  <Button className="w-full sm:w-auto">Favourite</Button>
                </div>
              </Card.Footer>
            </div>
          </Card>
        </div>
      ))}
    </div>
  );
}
