"use client";
import {
  Button,
  Calendar,
  DateField,
  Description,
  FieldError,
  FieldGroup,
  Fieldset,
  Form,
  Input,
  Label,
  ListBox,
  Select,
  TextArea,
  TextField,
} from "@heroui/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

const AddDonorPage = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const donorHandler = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(e.target);
    const bloodInfo = Object.fromEntries(formData.entries());

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/all`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(bloodInfo),
      });

      if (!res.ok) throw new Error("Server error, please try again");

      const addDonor = await res.json();

      if (addDonor.acknowledged) {
        router.refresh();
        router.push("/all");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to submit. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-zinc-50 px-4 py-6 sm:py-10">
      <div className="mx-auto w-full max-w-md overflow-x-hidden">
        <div className="mb-6 text-center">
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-6 w-6 text-red-600"
            >
              <path
                d="M12 2C12 2 5 10.5 5 15a7 7 0 0014 0c0-4.5-7-13-7-13z"
                fill="currentColor"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">
            Add Blood Donor
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Every detail helps save a life faster.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="w-full rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm sm:p-8">
          <Form onSubmit={donorHandler} className="w-full">
            <Fieldset className="w-full">
              <Fieldset.Legend className="text-left text-lg font-semibold text-zinc-900">
                Your Information
              </Fieldset.Legend>
              <Description className="mb-6 mt-1 text-left text-sm text-zinc-500">
                Please make sure all details are accurate.
              </Description>

              <FieldGroup className="w-full gap-5">
                <TextField isRequired name="name" className="w-full">
                  <Label className="text-sm font-medium text-zinc-700">
                    Name
                  </Label>
                  <Input
                    placeholder="Enter your name"
                    className="h-11 w-full rounded-lg"
                  />
                  <FieldError />
                </TextField>

                <TextField name="email" type="email" className="w-full">
                  <Label className="text-sm font-medium text-zinc-700">
                    Email
                  </Label>
                  <Input
                    placeholder="Enter your email"
                    className="h-11 w-full rounded-lg"
                  />
                  <FieldError />
                </TextField>

                <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2">
                  <TextField
                    isRequired
                    name="mobile"
                    type="tel"
                    className="w-full"
                  >
                    <Label className="text-sm font-medium text-zinc-700">
                      Mobile Number
                    </Label>
                    <Input
                      placeholder="e.g. 017XXXXXXXX"
                      className="h-11 w-full rounded-lg"
                    />
                    <FieldError />
                  </TextField>

                  <TextField name="mobile2" type="tel" className="w-full">
                    <Label className="text-sm font-medium text-zinc-700">
                      Alternative Number
                    </Label>
                    <Input
                      placeholder="Optional"
                      className="h-11 w-full rounded-lg"
                    />
                    <FieldError />
                  </TextField>
                </div>

                {/* ✅ FIXED: আগে এটা comment করা ছিল এবং item গুলোর
                    id/textValue ভুল বসানো ছিল (florida, delaware,
                    california, texas... এগুলো আসল blood group value
                    ছিল না, অন্য কোনো example থেকে কপি হয়ে গিয়েছিল)।
                    এখন সঠিক ৮টা blood group দিয়ে ঠিক করা হলো, এবং
                    আগের free-text "BloodGroup" input-এর বদলে এই
                    dropdown ব্যবহার করা হচ্ছে (ভুল টাইপ করার সুযোগ
                    থাকবে না, যেমন কেউ "a positive" লিখে ফেলতে পারতো) */}
                <Select
                  isRequired
                  name="BloodGroup"
                  placeholder="Select blood group"
                  className="w-full"
                >
                  <Label className="text-sm font-medium text-zinc-700">
                    Blood Group
                  </Label>
                  <Select.Trigger className="h-11 w-full rounded-lg">
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      <ListBox.Item id="A+" textValue="A+">
                        A+
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                      <ListBox.Item id="A-" textValue="A-">
                        A-
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                      <ListBox.Item id="B+" textValue="B+">
                        B+
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                      <ListBox.Item id="B-" textValue="B-">
                        B-
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                      <ListBox.Item id="AB+" textValue="AB+">
                        AB+
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                      <ListBox.Item id="AB-" textValue="AB-">
                        AB-
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                      <ListBox.Item id="O+" textValue="O+">
                        O+
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                      <ListBox.Item id="O-" textValue="O-">
                        O-
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                    </ListBox>
                  </Select.Popover>
                  <FieldError />
                </Select>

                <TextField
                  isRequired
                  name="location"
                  type="text"
                  className="w-full"
                >
                  <Label className="text-sm font-medium text-zinc-700">
                    Location
                  </Label>
                  <Input
                    placeholder="Enter your blood location"
                    className="h-11 w-full rounded-lg"
                  />
                  <FieldError />
                </TextField>

                <DateField className="w-full" name="date" type="date">
                  <Label className="text-sm font-medium text-zinc-700">
                    Last Donation Date
                  </Label>
                  <DateField.Group className="h-11 w-full rounded-lg">
                    <DateField.Input>
                      {(segment) => <DateField.Segment segment={segment} />}
                    </DateField.Input>
                    <DateField.Suffix>
                      <Calendar className="size-4 text-zinc-400" />
                    </DateField.Suffix>
                  </DateField.Group>
                </DateField>

                <TextField isRequired name="bio" className="w-full">
                  <Label className="text-sm font-medium text-zinc-700">
                    Bio
                  </Label>
                  <TextArea
                    placeholder="Tell us about yourself..."
                    className="min-h-24 w-full rounded-lg"
                  />
                  <Description className="text-xs text-zinc-400">
                    Minimum 10 characters
                  </Description>
                  <FieldError />
                </TextField>
              </FieldGroup>

              <Fieldset.Actions className="mt-8 flex w-full flex-col gap-3 sm:flex-row-reverse">
                <Button
                  type="submit"
                  isDisabled={isSubmitting}
                  className="h-11 w-full rounded-lg bg-red-600 font-semibold text-white hover:bg-red-700 sm:w-auto sm:flex-1"
                >
                  {isSubmitting ? "Saving..." : "Save Donor Info"}
                </Button>
                <Button
                  type="reset"
                  variant="secondary"
                  className="h-11 w-full rounded-lg font-semibold sm:w-auto"
                >
                  Cancel
                </Button>
              </Fieldset.Actions>
            </Fieldset>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default AddDonorPage;
