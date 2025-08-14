import React from "react";

function CofoundrShowMore({ curProfile }: { curProfile: OnboardingData }) {
  return (
    <>
      <div className="mt-20">
        <h2 className="heading-5"> Startup Plans</h2>
        <h3 className="heading-6 font-bold">Has Startup:</h3>
        <ul className="flex flex-col gap-y-1">
          {curProfile.hasStartup ? "Yes" : "No"}
        </ul>

        {curProfile.hasStartup && (
          <div>
            <h3 className="heading-6 font-bold">Startup Name:</h3>
            <ul className="flex flex-col gap-y-1">{curProfile.startupName}</ul>

            <h3 className="heading-6 font-bold">Startup Description:</h3>
            <ul className="flex flex-col gap-y-1">
              {curProfile.startupDescription}
            </ul>

            <h3 className="heading-6 font-bold">Time Spent on Startup:</h3>
            <ul className="flex flex-col gap-y-1">
              {curProfile.startupTimeSpent}
            </ul>

            <h3 className="heading-6 font-bold">Current Startup Funding:</h3>
            <ul className="flex flex-col gap-y-1">
              {curProfile.startupFunding}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-20">
        <h2 className="heading-5">Personal Interests</h2>

        <h3 className="heading-6 font-bold">Interests:</h3>
        <ul className="flex flex-col gap-y-1">{curProfile.interests}</ul>

        <h3 className="heading-6 font-bold">Hobbies:</h3>
        <ul className="flex flex-col gap-y-1">{curProfile.hobbies}</ul>

        <h3 className="heading-6 font-bold">Journey:</h3>
        <ul className="flex flex-col gap-y-1">{curProfile.journey}</ul>

        <h3 className="heading-6 font-bold">Extra Info:</h3>
        <ul className="flex flex-col gap-y-1">{curProfile.extra}</ul>
      </div>

      <div className="mt-20">
        <h2 className="heading-5">Socials</h2>

        <h3 className="heading-6 font-bold">LinkedIn:</h3>
        <ul className="flex flex-col gap-y-1">{curProfile.linkedin}</ul>

        <h3 className="heading-6 font-bold">Twitter:</h3>
        <ul className="flex flex-col gap-y-1">{curProfile.twitter}</ul>

        <h3 className="heading-6 font-bold">Git:</h3>
        <ul className="flex flex-col gap-y-1">{curProfile.git}</ul>

        <h3 className="heading-6 font-bold">Personal Website:</h3>
        <ul className="flex flex-col gap-y-1">{curProfile.personalWebsite}</ul>
      </div>
    </>
  );
}

export default CofoundrShowMore;
