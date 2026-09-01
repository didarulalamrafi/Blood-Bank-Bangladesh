"use client";

/**
 * ==============================================================
 * Donor Profile Page (/donor/add)
 * ==============================================================
 * এটা আর standalone donor তৈরি করে না — logged-in user এর
 * একাউন্টের সাথে ডোনার প্রোফাইল attach/update করে। তাই:
 *  - Name/Email এখন session থেকে আসে (read-only display, form
 *    field না) — একই তথ্য দুই জায়গায় রাখা এবং ডুপ্লিকেট এন্ট্রির
 *    ঝুঁকি এড়াতে।
 *  - সাবমিটে POST /all এর বদলে PATCH
 *    /api/users/:id/donor-profile কল হয় (backend এ বানাতে হবে)।
 *  - সেশন না থাকলে /login এ পাঠিয়ে দেয়।
 *
 * District -> Upazila -> Union ক্যাসকেডিং ফেচ লজিক অপরিবর্তিত।
 * ==============================================================
 */

import {
  Button,
  Calendar,
  DateField,
  DatePicker,
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
import { Droplet } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

const AddDonorPage = () => {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [imagePreview, setImagePreview] = useState(null);
  const [imageData, setImageData] = useState("");

  // Cascading location state
  const [district, setDistrict] = useState(null);
  const [upazila, setUpazila] = useState(null);
  const [union, setUnion] = useState(null);
  const [customUpazila, setCustomUpazila] = useState("");
  const [customArea, setCustomArea] = useState("");

  const [districtNames, setDistrictNames] = useState([]);
  const [upazilaNames, setUpazilaNames] = useState([]);
  const [unionNames, setUnionNames] = useState([]);
  const [loadingUpazilas, setLoadingUpazilas] = useState(false);
  const [loadingUnions, setLoadingUnions] = useState(false);

  // Redirect unauthenticated visitors — donor profile always belongs to a user
  useEffect(() => {
    if (!sessionLoading && !session?.user) {
      router.push("/login?next=/donor/add");
    }
  }, [sessionLoading, session, router]);

  // Load district list once on mount (tiny payload, ~1KB)
  useEffect(() => {
    fetch("/api/locations")
      .then((res) => res.json())
      .then((data) => setDistrictNames(data.districts || []))
      .catch((err) => console.error("Failed to load districts:", err));
  }, []);

  // Load upazilas whenever district changes
  useEffect(() => {
    if (!district) {
      setUpazilaNames([]);
      return;
    }
    setLoadingUpazilas(true);
    fetch(`/api/locations?district=${encodeURIComponent(district)}`)
      .then((res) => res.json())
      .then((data) => setUpazilaNames(data.upazilas || []))
      .catch((err) => console.error("Failed to load upazilas:", err))
      .finally(() => setLoadingUpazilas(false));
  }, [district]);

  // Load unions whenever district + upazila change
  useEffect(() => {
    if (!district || !upazila) {
      setUnionNames([]);
      return;
    }
    setLoadingUnions(true);
    fetch(
      `/api/locations?district=${encodeURIComponent(district)}&upazila=${encodeURIComponent(upazila)}`,
    )
      .then((res) => res.json())
      .then((data) => setUnionNames(data.unions || []))
      .catch((err) => console.error("Failed to load unions:", err))
      .finally(() => setLoadingUnions(false));
  }, [district, upazila]);

  const hasUpazilaList = upazilaNames.length > 0;
  const hasUnionList = unionNames.length > 0;

  const handleDistrictChange = (key) => {
    setDistrict(key);
    setUpazila(null);
    setCustomUpazila("");
    setUnion(null);
    setCustomArea("");
  };

  const handleUpazilaChange = (key) => {
    setUpazila(key);
    setCustomUpazila("");
    setUnion(null);
    setCustomArea("");
  };

  const handleCustomUpazilaChange = (value) => {
    setCustomUpazila(value);
    setUpazila(null);
    setUnion(null);
    setCustomArea("");
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setImagePreview(null);
      setImageData("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be smaller than 2MB.");
      return;
    }

    setError("");
    const reader = new FileReader();
    reader.onload = () => {
      setImageData(reader.result);
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const donorHandler = async (e) => {
    e.preventDefault();
    setError("");

    if (!session?.user?.id) {
      setError("আপনার সেশন খুঁজে পাওয়া যায়নি, আবার লগইন করুন।");
      return;
    }

    const upazilaValue = upazila || customUpazila;
    const areaValue = union || customArea;

    if (!district || !upazilaValue || !areaValue) {
      setError("Please select or enter District, Upazila and Union/Area.");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData(e.target);
    const bloodInfo = Object.fromEntries(formData.entries());

    bloodInfo.district = district;
    bloodInfo.upazila = upazilaValue;
    bloodInfo.union = areaValue;
    bloodInfo.location = [district, upazilaValue, areaValue]
      .filter(Boolean)
      .join(", ");

    bloodInfo.totalDonations = bloodInfo.totalDonations
      ? Number(bloodInfo.totalDonations)
      : 0;

    if (imageData) {
      bloodInfo.image = imageData;
    }

    try {
      const res = await fetch(`/api/users/${session.user.id}/donor-profile`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(bloodInfo),
      });

      if (!res.ok) throw new Error("Server error, please try again");

      const updated = await res.json();

      if (updated.acknowledged || updated.success) {
        setSuccess(true);
        router.refresh();
        setTimeout(() => router.push("/dashboard"), 1200);
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

  if (sessionLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-zinc-50 dark:bg-black">
        <p className="text-sm text-zinc-400">লোড হচ্ছে...</p>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen w-full bg-zinc-50 px-4 py-4 dark:bg-black sm:py-6">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-4 text-center">
          <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/40">
            <Droplet className="h-6 w-6 text-red-600" fill="currentColor" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            Become a Blood Donor
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Every detail helps save a life faster.
          </p>
        </div>

        {/* Signed-in account, shown read-only — kept in sync with the user record */}
        <div className="mb-3 flex items-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-sm font-semibold text-red-600 dark:bg-red-950/40">
            {session.user.name?.[0]?.toUpperCase() || "?"}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {session.user.name}
            </p>
            <p className="truncate text-xs text-zinc-500">
              {session.user.email}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-3 rounded-lg border border-red-100 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-3 rounded-lg border border-green-100 bg-green-50 px-4 py-2 text-sm text-green-700 dark:border-green-900/40 dark:bg-green-950/30 dark:text-green-300">
            আপনার ডোনার প্রোফাইল সেভ হয়েছে। ড্যাশবোর্ডে নিয়ে যাওয়া হচ্ছে...
          </div>
        )}

        <div className="w-full rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
          <Form onSubmit={donorHandler} className="w-full">
            <Fieldset className="w-full">
              <Fieldset.Legend className="text-center text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Donor Information
              </Fieldset.Legend>
              <Description className="mb-4 mt-1 text-center text-sm text-zinc-500">
                Please make sure all details are accurate.
              </Description>

              <FieldGroup className="w-full gap-3">
                {/* Photo upload field — single-line, compact */}
                <div className="flex w-full items-center gap-3 border-b border-zinc-100 pb-3 dark:border-zinc-800">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900">
                    {imagePreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imagePreview}
                        alt="Donor preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-zinc-400">
                        No photo
                      </div>
                    )}
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <label
                      htmlFor="donorImage"
                      className="w-fit cursor-pointer rounded-md border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
                    >
                      {imagePreview ? "Change Photo" : "Upload Photo"}
                    </label>
                    <p className="truncate text-xs text-zinc-400">
                      Optional, max 2MB (JPG, PNG)
                    </p>
                  </div>
                  <input
                    id="donorImage"
                    name="imageFile"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>

                <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
                  <TextField
                    isRequired
                    name="mobile"
                    type="tel"
                    className="w-full"
                  >
                    <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Mobile Number
                    </Label>
                    <Input
                      placeholder="e.g. 017XXXXXXXX"
                      className="h-10 w-full rounded-md"
                    />
                    <FieldError />
                  </TextField>

                  <TextField name="mobile2" type="tel" className="w-full">
                    <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Alternative Number
                    </Label>
                    <Input
                      placeholder="Optional"
                      className="h-10 w-full rounded-md"
                    />
                    <FieldError />
                  </TextField>
                </div>

                <Select
                  isRequired
                  name="BloodGroup"
                  placeholder="Select blood group"
                  className="w-full"
                >
                  <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Blood Group
                  </Label>
                  <Select.Trigger className="h-10 w-full rounded-md">
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

                {/* Location: District -> Upazila -> Union / Area */}
                <Select
                  isRequired
                  placeholder="Select district"
                  className="w-full"
                  selectedKey={district}
                  onSelectionChange={handleDistrictChange}
                >
                  <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    District
                  </Label>
                  <Select.Trigger className="h-10 w-full rounded-md">
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox items={districtNames.map((n) => ({ id: n }))}>
                      {(item) => (
                        <ListBox.Item id={item.id} textValue={item.id}>
                          {item.id}
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      )}
                    </ListBox>
                  </Select.Popover>
                  <FieldError />
                </Select>

                {loadingUpazilas ? (
                  <Select
                    isDisabled
                    placeholder="Loading..."
                    className="w-full"
                  >
                    <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Upazila
                    </Label>
                    <Select.Trigger className="h-10 w-full rounded-md">
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>
                  </Select>
                ) : hasUpazilaList ? (
                  <Select
                    isRequired
                    isDisabled={!district}
                    placeholder={
                      !district ? "Select district first" : "Select upazila"
                    }
                    className="w-full"
                    selectedKey={upazila}
                    onSelectionChange={handleUpazilaChange}
                  >
                    <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Upazila
                    </Label>
                    <Select.Trigger className="h-10 w-full rounded-md">
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover>
                      <ListBox items={upazilaNames.map((n) => ({ id: n }))}>
                        {(item) => (
                          <ListBox.Item id={item.id} textValue={item.id}>
                            {item.id}
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        )}
                      </ListBox>
                    </Select.Popover>
                    <FieldError />
                  </Select>
                ) : (
                  <TextField
                    isRequired={!!district}
                    isDisabled={!district}
                    className="w-full"
                    value={customUpazila}
                    onChange={handleCustomUpazilaChange}
                  >
                    <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Upazila
                    </Label>
                    <Input
                      placeholder={
                        district
                          ? "No upazila list for this district — type your upazila"
                          : "Select district first"
                      }
                      className="h-10 w-full rounded-md"
                    />
                    <FieldError />
                  </TextField>
                )}

                {loadingUnions ? (
                  <Select
                    isDisabled
                    placeholder="Loading..."
                    className="w-full"
                  >
                    <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Union
                    </Label>
                    <Select.Trigger className="h-10 w-full rounded-md">
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>
                  </Select>
                ) : hasUnionList ? (
                  <Select
                    isRequired
                    isDisabled={!upazila && !customUpazila}
                    placeholder={
                      upazila || customUpazila
                        ? "Select union"
                        : "Select upazila first"
                    }
                    className="w-full"
                    selectedKey={union}
                    onSelectionChange={(key) => setUnion(key)}
                  >
                    <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Union
                    </Label>
                    <Select.Trigger className="h-10 w-full rounded-md">
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover>
                      <ListBox items={unionNames.map((n) => ({ id: n }))}>
                        {(item) => (
                          <ListBox.Item id={item.id} textValue={item.id}>
                            {item.id}
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        )}
                      </ListBox>
                    </Select.Popover>
                    <FieldError />
                  </Select>
                ) : (
                  <TextField
                    isRequired={!!(upazila || customUpazila)}
                    isDisabled={!upazila && !customUpazila}
                    className="w-full"
                    value={customArea}
                    onChange={setCustomArea}
                  >
                    <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Area
                    </Label>
                    <Input
                      placeholder={
                        upazila || customUpazila
                          ? "No union list for this upazila — type your area"
                          : "Select upazila first"
                      }
                      className="h-10 w-full rounded-md"
                    />
                    <FieldError />
                  </TextField>
                )}

                <TextField name="BloodBankName" type="text" className="w-full">
                  <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Your Blood Bank
                  </Label>
                  <Input
                    placeholder="If you are a member of any Blood Donation Group."
                    className="h-10 w-full rounded-md"
                  />
                  <FieldError />
                </TextField>

                <TextField
                  name="totalDonations"
                  type="number"
                  className="w-full"
                >
                  <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Total Blood Donation
                  </Label>
                  <Input
                    placeholder="How many times have you donated so far?"
                    min={0}
                    step={1}
                    className="h-10 w-full rounded-md"
                  />
                  <FieldError />
                </TextField>

                <DatePicker className="w-full" name="date">
                  <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Last Donation Date
                  </Label>
                  <DateField.Group fullWidth>
                    <DateField.Input>
                      {(segment) => <DateField.Segment segment={segment} />}
                    </DateField.Input>
                    <DateField.Suffix>
                      <DatePicker.Trigger>
                        <DatePicker.TriggerIndicator />
                      </DatePicker.Trigger>
                    </DateField.Suffix>
                  </DateField.Group>
                  <DatePicker.Popover>
                    <Calendar aria-label="Event date">
                      <Calendar.Header>
                        <Calendar.YearPickerTrigger>
                          <Calendar.YearPickerTriggerHeading />
                          <Calendar.YearPickerTriggerIndicator />
                        </Calendar.YearPickerTrigger>
                        <Calendar.NavButton slot="previous" />
                        <Calendar.NavButton slot="next" />
                      </Calendar.Header>
                      <Calendar.Grid>
                        <Calendar.GridHeader>
                          {(day) => (
                            <Calendar.HeaderCell>{day}</Calendar.HeaderCell>
                          )}
                        </Calendar.GridHeader>
                        <Calendar.GridBody>
                          {(date) => <Calendar.Cell date={date} />}
                        </Calendar.GridBody>
                      </Calendar.Grid>
                      <Calendar.YearPickerGrid>
                        <Calendar.YearPickerGridBody>
                          {({ year }) => (
                            <Calendar.YearPickerCell year={year} />
                          )}
                        </Calendar.YearPickerGridBody>
                      </Calendar.YearPickerGrid>
                    </Calendar>
                  </DatePicker.Popover>
                </DatePicker>

                <TextField name="bio" className="w-full">
                  <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Bio
                  </Label>
                  <TextArea
                    placeholder="Tell us anything..."
                    className="min-h-20 w-full rounded-md"
                  />
                  <FieldError />
                </TextField>
              </FieldGroup>

              <Fieldset.Actions className="mt-6 flex w-full flex-col gap-2 sm:flex-row-reverse">
                <Button
                  type="submit"
                  isDisabled={isSubmitting}
                  className="h-10 w-full rounded-md bg-red-600 font-semibold text-white hover:bg-red-700 sm:w-auto sm:flex-1"
                >
                  {isSubmitting ? "Saving..." : "Save Donor Info"}
                </Button>
                <Button
                  type="reset"
                  variant="outline"
                  className="h-10 w-full rounded-md font-semibold sm:w-auto"
                  onPress={() => {
                    setImagePreview(null);
                    setImageData("");
                    setDistrict(null);
                    setUpazila(null);
                    setCustomUpazila("");
                    setUnion(null);
                    setCustomArea("");
                  }}
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
