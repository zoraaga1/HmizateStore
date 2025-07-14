"use client";
import Breadcrumb from "@/components/Common/Breadcrumb";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

const Signup = () => {
  const router = useRouter();
  const [role, setRole] = useState("buyer");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [cinFile, setCinFile] = useState<File | null>(null);
const [cinUrl, setCinUrl] = useState<string>("");
const [isUploadingCIN, setIsUploadingCIN] = useState(false);
const [diplomaFile, setDiplomaFile] = useState<File | null>(null);
const [uploadedDiplomaUrl, setUploadedDiplomaUrl] = useState<string>("");



  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
        //sending files to vercel blob
        let uploadedCinUrl = "";

        if ((role === "seller" || role === "expert") && cinFile) {
          try {
            const uploadRes = await fetch(
              `https://blob.vercel-storage.com/users/${cinFile.name}`,
              {
                method: "PUT",
                headers: {
                  Authorization: `Bearer ${process.env.NEXT_PUBLIC_hmizate_READ_WRITE_TOKEN}`,
                  "x-content-type": cinFile.type,
                  "x-content-length": cinFile.size.toString(),
                },
                body: cinFile,
              }
            );
        
            if (!uploadRes.ok) {
              const errorText = await uploadRes.text();
              throw new Error("CIN Upload failed: " + errorText);
            }
        
            const json = await uploadRes.json();
            uploadedCinUrl = json.url;
          } catch (err) {
            setError("Failed to upload CIN image.");
            setIsLoading(false);
            console.error("CIN upload error:", err);
            return;
          }
        }

        // sending diploma to vercel blob
        let diplomaUrl = "";

if (role === "expert" && diplomaFile) {
  try {
    const uploadDiplomaRes = await fetch(
      `https://blob.vercel-storage.com/users/${diplomaFile.name}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_hmizate_READ_WRITE_TOKEN}`,
          "x-content-type": diplomaFile.type,
          "x-content-length": diplomaFile.size.toString(),
        },
        body: diplomaFile,
      }
    );

    if (!uploadDiplomaRes.ok) {
      const errorText = await uploadDiplomaRes.text();
      throw new Error("Diploma upload failed: " + errorText);
    }

    const diplomaJson = await uploadDiplomaRes.json();
    diplomaUrl = diplomaJson.url;
  } catch (err) {
    setError("Failed to upload diploma.");
    setIsLoading(false);
    console.error("Diploma upload error:", err);
    return;
  }
}

        
    const formData = new FormData(e.target);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      role: formData.get("role"),
      cin: uploadedCinUrl || null,
      diploma: diplomaUrl || null,
      password: formData.get("password"),
      confirmPassword: formData.get("re-type-password"),
    };

    // Client-side validation
    if (data.password !== data.confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    // Role-specific validation
    if ((role === "seller" || role === "expert") && !data.cin) {
      setError("CIN is required for sellers and experts.");
      setIsLoading(false);
      return;
    }
    
    if (role === "expert" && !data.diploma) {
      setError("Diploma information is required for experts.");
      setIsLoading(false);
      return;
    }


    try {
      // Remove unnecessary fields before sending
      delete data.confirmPassword;
      
      // For buyers, remove CIN and diploma since they're not required
      if (role === "buyer") {
        delete data.cin;
        delete data.diploma;
      }
      // For sellers, remove diploma since it's not required
      else if (role === "seller") {
        delete data.diploma;
      }

      // Send request to backend using the data object directly
      const response = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle backend validation errors
        if (result.conflicts) {
          const conflictMessages = result.conflicts.map(
            conflict => `${conflict.charAt(0).toUpperCase() + conflict.slice(1)} already in use`
          );
          setError(conflictMessages.join(", "));
        } else {
          setError(result.message || "Registration failed. Please try again.");
        }
        return;
      }

      // Registration successful
      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/signin");
      }, 3000);

    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Registration error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Breadcrumb title={"Signup"} pages={["Signup"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="max-w-[570px] w-full mx-auto rounded-xl bg-white shadow-1 p-4 sm:p-7.5 xl:p-11">
            <div className="text-center mb-11">
              <h2 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark mb-1.5">
                Create an Account
              </h2>
              <p>Enter your detail below</p>
            </div>

            <div className="mt-5.5">
              <form onSubmit={handleSubmit}>
                <div className="mb-5">
                  <label htmlFor="name" className="block mb-2.5">
                    Full Name <span className="text-red">*</span>
                  </label>

                  <input
                    type="text"
                    name="name"
                    id="name"
                    placeholder="Enter your full name"
                    required
                    className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                  />
                </div>

                <div className="mb-5">
                  <label htmlFor="email" className="block mb-2.5">
                    Email Address <span className="text-red">*</span>
                  </label>

                  <input
                    type="email"
                    name="email"
                    id="email"
                    placeholder="Enter your email address"
                    required
                    className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                  />
                </div>

                <div className="mb-5">
                  <label htmlFor="role" className="block mb-2.5">
                    Role <span className="text-red">*</span>
                  </label>

                  <select
                    id="role"
                    name="role"
                    className="form-input rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    value={role}
                    required
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="buyer">Buyer</option>
                    <option value="seller">Seller</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>

                {/*for seller and expert*/}
                {(role === "seller" || role === "expert") && (
                  <div className="mb-5">
                    <label htmlFor="cin" className="block mb-2.5">
                      CIN <span className="text-red">*</span>
                    </label>
                    <input
                      type="file"
                      multiple
                      id="cin"
                      name="cin"
                      required
                      placeholder="Enter your CIN"
                      onChange={(e) => setCinFile(e.target.files?.[0] || null)}
                      className="form-input rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    />
                  </div>
                  
                )}

                {role === "expert" && (
                  <div className="mb-5">
                  <label htmlFor="diploma" className="block mb-2.5">
                    Diploma <span className="text-red">*</span>
                  </label>
                  <input
                    type="file"
                    id="diploma"
                    name="diploma"
                    required
                    onChange={(e) => setDiplomaFile(e.target.files?.[0] || null)}
                    className="form-input rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                  />
                </div>
                )}

                <div className="mb-5">
                  <label htmlFor="password" className="block mb-2.5">
                    Password <span className="text-red">*</span>
                  </label>

                  <input
                    type="password"
                    name="password"
                    id="password"
                    placeholder="Enter your password"
                    required
                    autoComplete="on"
                    className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                  />
                </div>

                <div className="mb-5.5">
                  <label htmlFor="re-type-password" className="block mb-2.5">
                    Re-type Password <span className="text-red">*</span>
                  </label>

                  <input
                    type="password"
                    name="re-type-password"
                    id="re-type-password"
                    placeholder="Re-type your password"
                    required
                    autoComplete="on"
                    className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                  />

                  {error && (
                    <p className="text-red text-sm mt-1">{error}</p>
                  )}

                </div>

                <button
                  type="submit"
                  className="w-full flex justify-center font-medium text-white bg-dark py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue mt-7.5"
                >
                  Create Account
                </button>

                <p className="text-center mt-6">
                  Already have an account?
                  <Link
                    href="/signin"
                    className="text-dark ease-out duration-200 hover:text-blue pl-2"
                  >
                    Sign in Now
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Signup;
