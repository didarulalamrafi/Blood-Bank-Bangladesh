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
  TextArea,
  TextField,
  Select,
} from "@heroui/react";
import { redirect, useRouter } from "next/navigation";

const AddDonorPage = () => {
  const route = useRouter();
  const donorHandler = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const bloodInfo = Object.fromEntries(formData.entries());
    console.log(bloodInfo);
    const res = await fetch("http://localhost:5000/all", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(bloodInfo),
    });
    const adddonor = await res.json();
    if (adddonor.acknowledged) {
      route.refresh();
      route.push("/all");
    }
    console.log(adddonor);
  };

  return (
    <div>
      <h1 className="text-center text-4xl text-red-600 font-bold">
        Add Blood Donor
      </h1>
      <div className="w-4/12 mx-auto my-5">
        <Form onSubmit={donorHandler} className="w-full max-w-96">
          <Fieldset>
            <Fieldset.Legend className="text-center font-bold text-2xl">
              Add your Info
            </Fieldset.Legend>
            <Description className="text-center">
              information should be true.
            </Description>
            <FieldGroup>
              <TextField isRequired name="name">
                <Label>Name</Label>
                <Input placeholder="Enter your name" />
                <FieldError />
              </TextField>
              <TextField name="email" type="email">
                <Label>Email</Label>
                <Input placeholder="Enter your email" />
                <FieldError />
              </TextField>
              <TextField isRequired name="mobile" type="number">
                <Label>Mobile Number</Label>
                <Input placeholder="Enter your mobile number" />
                <FieldError />
              </TextField>
              <TextField name="mobile2" type="number">
                <Label>Alternative Number</Label>
                <Input placeholder="Enter your mobile number" />
                <FieldError />
              </TextField>
              <TextField name="BloodGroup" type="text">
                <Label>Blood Group</Label>
                <Input placeholder="Enter your Blood Group 'A+' " />
                <FieldError />
              </TextField>

              {/* Blood Group */}
              {/* <Select placeholder="Select one">
                <Label>Blood Group</Label>
                <Select.Trigger>
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                  <ListBox>
                    <ListBox.Item id="florida" textValue="Florida">
                      A+
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                    <ListBox.Item id="delaware" textValue="Delaware">
                      B+
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                    <ListBox.Item id="california" textValue="California">
                      AB+
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                    <ListBox.Item id="texas" textValue="Texas">
                      O+
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                    <ListBox.Item id="new-york" textValue="New York">
                      A-
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                    <ListBox.Item id="washington" textValue="Washington">
                      B-
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                    <ListBox.Item id="washington" textValue="Washington">
                      AB-
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                    <ListBox.Item id="washington" textValue="Washington">
                      O-
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  </ListBox>
                </Select.Popover>
              </Select> */}

              <TextField isRequired name="location" type="text">
                <Label>Location</Label>
                <Input placeholder="Enter your Blood Location" />
                <FieldError />
              </TextField>
              <DateField className="w-[256px]" name="date" type="date">
                <Label>Last Donatin Date</Label>
                <DateField.Group>
                  <DateField.Input>
                    {(segment) => <DateField.Segment segment={segment} />}
                  </DateField.Input>
                  <DateField.Suffix>
                    <Calendar className="size-4 text-muted" />
                  </DateField.Suffix>
                </DateField.Group>
              </DateField>
              {/* <TextField name="imgae" type="image">
                <Label>Image</Label>
                <Input placeholder="Enter your image url" />
                <FieldError />
              </TextField> */}
              <TextField isRequired name="bio">
                <Label>Bio</Label>
                <TextArea placeholder="Tell us about yourself..." />
                <Description>Minimum 10 characters</Description>
                <FieldError />
              </TextField>
            </FieldGroup>
            <Fieldset.Actions>
              <Button type="submit">Save</Button>
              <Button type="reset" variant="secondary">
                Cancel
              </Button>
            </Fieldset.Actions>
          </Fieldset>
        </Form>
      </div>
    </div>
  );
};

export default AddDonorPage;
