"use client";

/**
 * ==============================================================
 * Register Page
 * ==============================================================
 * Register-এ শুধু account level info নেওয়া হচ্ছে —
 * Name, Email, Phone, Password. Donor হতে চাইলে সাইনআপের পরে
 * আলাদা /donor/add পেজে গিয়ে ব্লাড গ্রুপ, লোকেশন ইত্যাদি দেবে।
 *
 * Google/Facebook বাটন signIn.social() কল করে — Better Auth
 * নিজেই OAuth redirect হ্যান্ডল করে, callbackURL এ ফিরিয়ে আনে।
 * এই providers গুলো auth.js সার্ভার কনফিগে (socialProviders)
 * enable করা থাকতে হবে, নাহলে signIn.social রানটাইমে fail করবে।
 * ==============================================================
 */

import { useState } from "react";
import {
  Button,
  Description,
  FieldError,
  FieldGroup,
  Fieldset,
  Form,
  Input,
  Label,
  TextField,
} from "@heroui/react";
import { Droplet, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, signUp } from "@/lib/auth-client";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path
      fill="#FFC107"
      d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.1 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
    />
    <path
      fill="#FF3D00"
      d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.1 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
    />
    <path
      fill="#4CAF50"
      d="M24 44c5.5 0 10.4-1.9 14.3-5.1l-6.6-5.4c-2 1.4-4.6 2.3-7.7 2.3-5.3 0-9.7-3.4-11.3-8.1l-6.6 5.1C9.6 39.6 16.2 44 24 44z"
    />
    <path
      fill="#1976D2"
      d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.5l6.6 5.4C41.4 35.8 44 30.4 44 24c0-1.3-.1-2.7-.4-3.5z"
    />
  </svg>
);

const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#1877F2"
      d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.7 4.53-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.89v2.26h3.32l-.53 3.49h-2.79V24C19.61 23.09 24 18.1 24 12.07z"
    />
  </svg>
);

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("পাসওয়ার্ড দুটো মিলছে না");
      return;
    }
    if (password.length < 8) {
      setError("পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে");
      return;
    }

    setLoading(true);
    try {
      const { error: signUpError } = await signUp.email({
        name,
        email,
        password,
        phone,
      });

      if (signUpError) {
        setError(signUpError.message || "একাউন্ট তৈরি করা যায়নি");
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      setError("সার্ভারের সাথে সংযোগ করা যায়নি");
    } finally {
      setLoading(false);
    }
  };

  const handleSocial = async (provider) => {
    setError("");
    setSocialLoading(provider);
    try {
      const { error: socialError } = await signIn.social({
        provider,
        callbackURL: "/dashboard",
      });
      if (socialError) {
        setError(
          socialError.message || `${provider} দিয়ে সাইন আপ ব্যর্থ হয়েছে`,
        );
        setSocialLoading("");
      }
      // সফল হলে Better Auth নিজেই redirect করে দেবে
    } catch (err) {
      setError("সার্ভারের সাথে সংযোগ করা যায়নি");
      setSocialLoading("");
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-zinc-50 px-4 py-10 dark:bg-black">
      <div className="w-full max-w-md">
        <div className="mb-4 text-center">
          <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/40">
            <Droplet className="h-6 w-6 text-red-600" fill="currentColor" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            আমার ব্লাড ব্যাংক
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            নতুন একাউন্ট তৈরি করে শুরু করুন
          </p>
        </div>

        {error && (
          <div className="mb-3 rounded-lg border border-red-100 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="w-full rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mb-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleSocial("google")}
              disabled={!!socialLoading}
              className="flex h-10 items-center justify-center gap-2 rounded-md border border-zinc-200 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
            >
              <GoogleIcon />
              {socialLoading === "google" ? "..." : "Google"}
            </button>
            <button
              type="button"
              onClick={() => handleSocial("facebook")}
              disabled={!!socialLoading}
              className="flex h-10 items-center justify-center gap-2 rounded-md border border-zinc-200 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
            >
              <FacebookIcon />
              {socialLoading === "facebook" ? "..." : "Facebook"}
            </button>
          </div>

          <div className="mb-4 flex items-center gap-3 text-xs text-zinc-400">
            <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
            অথবা ইমেইল দিয়ে
            <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
          </div>

          <Form onSubmit={handleRegister} className="w-full">
            <Fieldset className="w-full">
              <FieldGroup className="w-full gap-3">
                <TextField
                  isRequired
                  name="name"
                  className="w-full"
                  value={name}
                  onChange={setName}
                >
                  <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    পূর্ণ নাম
                  </Label>
                  <Input
                    placeholder="আপনার নাম"
                    className="h-10 w-full rounded-md"
                  />
                  <FieldError />
                </TextField>

                <TextField
                  isRequired
                  name="email"
                  type="email"
                  className="w-full"
                  value={email}
                  onChange={setEmail}
                >
                  <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    ইমেইল
                  </Label>
                  <Input
                    placeholder="you@example.com"
                    className="h-10 w-full rounded-md"
                  />
                  <FieldError />
                </TextField>

                <TextField
                  isRequired
                  name="phone"
                  type="tel"
                  className="w-full"
                  value={phone}
                  onChange={setPhone}
                >
                  <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    ফোন নম্বর
                  </Label>
                  <Input
                    placeholder="01XXXXXXXXX"
                    className="h-10 w-full rounded-md"
                  />
                  <FieldError />
                </TextField>

                <div className="grid w-full grid-cols-2 gap-3">
                  <TextField
                    isRequired
                    name="password"
                    className="w-full"
                    value={password}
                    onChange={setPassword}
                  >
                    <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      পাসওয়ার্ড
                    </Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="h-10 w-full rounded-md pr-9"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <FieldError />
                  </TextField>

                  <TextField
                    isRequired
                    name="confirmPassword"
                    className="w-full"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                  >
                    <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      পুনরায় পাসওয়ার্ড
                    </Label>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="h-10 w-full rounded-md"
                    />
                    <FieldError />
                  </TextField>
                </div>

                <Description className="text-xs text-zinc-400">
                  একাউন্ট তৈরির পর ড্যাশবোর্ড থেকে চাইলে ডোনার হিসেবে আপনার
                  প্রোফাইল সম্পূর্ণ করতে পারবেন।
                </Description>
              </FieldGroup>

              <Fieldset.Actions className="mt-4 w-full">
                <Button
                  type="submit"
                  isDisabled={loading}
                  className="h-10 w-full rounded-md bg-red-600 font-semibold text-white hover:bg-red-700"
                >
                  {loading ? "একাউন্ট তৈরি হচ্ছে..." : "একাউন্ট তৈরি করুন"}
                </Button>
              </Fieldset.Actions>
            </Fieldset>
          </Form>
        </div>

        <p className="mt-5 text-center text-sm text-zinc-500">
          আগে থেকেই একাউন্ট আছে?{" "}
          <Link
            href="/login"
            className="font-semibold text-red-600 hover:underline"
          >
            লগইন করুন
          </Link>
        </p>
      </div>
    </div>
  );
}
