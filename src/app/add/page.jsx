"use client";
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
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// District -> Upazila -> Union data now lives server-side only, served
// through /api/locations in slices (see app/api/locations/route.js).
// This keeps the ~60KB dataset out of the client bundle entirely — the
// browser only ever fetches the few KB it actually needs at each step.

const AddDonorPage = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

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

  // Check if upazila and union lists exist
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

    // Get the actual upazila value (from select or custom input)
    const upazilaValue = upazila || customUpazila;
    // Get the actual union/area value (from select or custom input)
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

    // Ensure total donations is stored as a number, defaulting to 0
    bloodInfo.totalDonations = bloodInfo.totalDonations
      ? Number(bloodInfo.totalDonations)
      : 0;

    if (imageData) {
      bloodInfo.image = imageData;
    }

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
    <div className="min-h-screen w-full bg-white px-4 py-4 sm:py-6">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-4 text-center">
          <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-9 w-8.5 text-red-600"
            >
              <path
                d="M12 2C12 2 5 10.5 5 15a7 7 0 0114 0c0-4.5-7-13-7-13z"
                fill="currentColor"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">
            Become{" "}
            <span
              className="text-2xl sm:text-3xl font-black tracking-widest uppercase select-none
           bg-gradient-to-b from-red-500 via-red-700 to-black 
           bg-clip-text text-transparent 
           drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]
           transition-all duration-300
           inline-block animate-[spin_1s_linear_5]"
            >
              a
            </span>{" "}
            Blood Donor
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Every detail helps save a life faster.
          </p>
        </div>

        {error && (
          <div className="mb-3 rounded-lg border border-red-100 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="w-full rounded-lg border border-gray-200 bg-white p-6 sm:p-6 shadow-sm">
          <Form onSubmit={donorHandler} className="w-full">
            <Fieldset className="w-full">
              <Fieldset.Legend className="text-center text-lg font-semibold text-zinc-900">
                Your Information
              </Fieldset.Legend>
              <Description className="mb-4 mt-1 text-center text-sm text-zinc-500">
                Please make sure all details are accurate.
              </Description>

              <FieldGroup className="w-full gap-3">
                {/* Photo upload field */}
                <div className="flex w-full flex-col items-center gap-1 pb-2 border-b border-gray-100">
                  <div className="h-24 w-24 overflow-hidden rounded-full border border-gray-200 bg-gray-50">
                    {imagePreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imagePreview}
                        alt="Donor preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                        No photo
                      </div>
                    )}
                  </div>

                  <label
                    htmlFor="donorImage"
                    className="cursor-pointer rounded-md border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    {imagePreview ? "Change Photo" : "Upload Photo"}
                  </label>
                  <input
                    id="donorImage"
                    name="imageFile"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <p className="text-xs text-gray-400">
                    Optional, max 2MB (JPG, PNG)
                  </p>
                </div>

                <TextField isRequired name="name" className="w-full">
                  <Label className="text-sm font-medium text-zinc-700">
                    Name
                  </Label>
                  <Input
                    placeholder="Enter your name"
                    className="h-10 w-full rounded-md"
                  />
                  <FieldError />
                </TextField>

                <TextField name="email" type="email" className="w-full">
                  <Label className="text-sm font-medium text-zinc-700">
                    Email
                  </Label>
                  <Input
                    placeholder="Enter your email"
                    className="h-10 w-full rounded-md"
                  />
                  <FieldError />
                </TextField>

                <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
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
                      className="h-10 w-full rounded-md"
                    />
                    <FieldError />
                  </TextField>

                  <TextField name="mobile2" type="tel" className="w-full">
                    <Label className="text-sm font-medium text-zinc-700">
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
                  <Label className="text-sm font-medium text-zinc-700">
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
                  <Label className="text-sm font-medium text-zinc-700">
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
                    <Label className="text-sm font-medium text-zinc-700">
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
                    <Label className="text-sm font-medium text-zinc-700">
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
                    <Label className="text-sm font-medium text-zinc-700">
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
                    <Label className="text-sm font-medium text-zinc-700">
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
                    <Label className="text-sm font-medium text-zinc-700">
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
                    <Label className="text-sm font-medium text-zinc-700">
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
                  <Label className="text-sm font-medium text-zinc-700">
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
                  <Label className="text-sm font-medium text-zinc-700">
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
                  <Label>Last Donation Date</Label>
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
                  <Label className="text-sm font-medium text-zinc-700">
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
                  className="h-10 w-full rounded-md bg-red-600 font-semibold text-white hover:bg-blue-700 sm:w-auto sm:flex-1"
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
