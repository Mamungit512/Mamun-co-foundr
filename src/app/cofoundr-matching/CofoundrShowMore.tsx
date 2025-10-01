import React from "react";
import { motion } from "motion/react";
import Link from "next/link";

function CofoundrShowMore({ curProfile }: { curProfile: OnboardingData }) {
  return (
    <div className="space-y-12">
      {/* Startup Plans Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h2 className="heading-5 mb-6 text-center text-yellow-300">
          Startup Plans
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-300">Has Startup:</span>
            <span
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                curProfile.hasStartup
                  ? "border border-green-500/30 bg-green-500/20 text-green-400"
                  : "border border-gray-500/30 bg-gray-500/20 text-gray-400"
              }`}
            >
              {curProfile.hasStartup ? "Yes" : "No"}
            </span>
          </div>

          {curProfile.hasStartup && (
            <div className="space-y-4 border-l-2 border-yellow-300/30 pl-4">
              <div>
                <h3 className="heading-6 mb-2 font-bold text-yellow-300">
                  Startup Name
                </h3>
                <p className="text-gray-300">{curProfile.startupName}</p>
              </div>
              <div>
                <h3 className="heading-6 mb-2 font-bold text-yellow-300">
                  Description
                </h3>
                <p className="leading-relaxed text-gray-300">
                  {curProfile.startupDescription}
                </p>
              </div>
              <div>
                <h3 className="heading-6 mb-2 font-bold text-yellow-300">
                  Time Investment
                </h3>
                <p className="text-gray-300">{curProfile.startupTimeSpent}</p>
              </div>
              <div>
                <h3 className="heading-6 mb-2 font-bold text-yellow-300">
                  Current Funding
                </h3>
                <p className="text-gray-300">{curProfile.startupFunding}</p>
              </div>
              <div>
                <h3 className="heading-6 mb-2 font-bold text-yellow-300">
                  Equity Expectation (%)
                </h3>
                <p className="text-gray-300">
                  {typeof curProfile?.equityExpectation === "number"
                    ? `${curProfile.equityExpectation}%`
                    : "Not provided"}
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Personal Interests Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
      >
        <h2 className="heading-5 mb-6 text-center text-yellow-300">
          Personal Interests
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <h3 className="heading-6 mb-3 font-bold text-yellow-300">
              Interests
            </h3>
            <p className="leading-relaxed text-gray-300">
              {curProfile.interests}
            </p>
          </div>

          <div>
            <h3 className="heading-6 mb-3 font-bold text-yellow-300">
              Hobbies
            </h3>
            <p className="leading-relaxed text-gray-300">
              {curProfile.hobbies}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Socials Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
      >
        <h2 className="heading-5 mb-6 text-center text-yellow-300">Socials</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {curProfile?.linkedin ? (
            <Link
              href={curProfile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex cursor-pointer items-center space-x-3 rounded-lg border border-gray-700/30 bg-gray-800/30 p-3 hover:border-gray-600 hover:bg-gray-800/50"
            >
              <span className="text-blue-400">💼</span>
              <div>
                <h3 className="font-semibold text-gray-300">LinkedIn</h3>
                <p className="text-sm text-gray-400">{curProfile.linkedin}</p>
              </div>
            </Link>
          ) : (
            <div className="flex items-center space-x-3 rounded-lg border border-gray-700/30 bg-gray-800/30 p-3">
              <span className="text-blue-400">💼</span>
              <div>
                <h3 className="font-semibold text-gray-300">LinkedIn</h3>
                <p className="text-sm text-gray-400">Not provided</p>
              </div>
            </div>
          )}

          {curProfile?.twitter ? (
            <Link
              href={curProfile.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="flex cursor-pointer items-center space-x-3 rounded-lg border border-gray-700/30 bg-gray-800/30 p-3 hover:border-gray-600 hover:bg-gray-800/50"
            >
              <span className="text-blue-400">🐦</span>
              <div>
                <h3 className="font-semibold text-gray-300">Twitter</h3>
                <p className="text-sm text-gray-400">{curProfile.twitter}</p>
              </div>
            </Link>
          ) : (
            <div className="flex items-center space-x-3 rounded-lg border border-gray-700/30 bg-gray-800/30 p-3">
              <span className="text-blue-400">🐦</span>
              <div>
                <h3 className="font-semibold text-gray-300">Twitter</h3>
                <p className="text-sm text-gray-400">Not provided</p>
              </div>
            </div>
          )}

          {curProfile?.git ? (
            <Link
              href={curProfile.git}
              target="_blank"
              rel="noopener noreferrer"
              className="flex cursor-pointer items-center space-x-3 rounded-lg border border-gray-700/30 bg-gray-800/30 p-3 hover:border-gray-600 hover:bg-gray-800/50"
            >
              <span className="text-green-400">📝</span>
              <div>
                <h3 className="font-semibold text-gray-300">Git</h3>
                <p className="text-sm text-gray-400">{curProfile.git}</p>
              </div>
            </Link>
          ) : (
            <div className="flex items-center space-x-3 rounded-lg border border-gray-700/30 bg-gray-800/30 p-3">
              <span className="text-green-400">📝</span>
              <div>
                <h3 className="font-semibold text-gray-300">Git</h3>
                <p className="text-sm text-gray-400">Not provided</p>
              </div>
            </div>
          )}

          {curProfile?.personalWebsite ? (
            <Link
              href={curProfile.personalWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className="flex cursor-pointer items-center space-x-3 rounded-lg border border-gray-700/30 bg-gray-800/30 p-3 hover:border-gray-600 hover:bg-gray-800/50"
            >
              <span className="text-purple-400">🌐</span>
              <div>
                <h3 className="font-semibold text-gray-300">Website</h3>
                <p className="text-sm text-gray-400">
                  {curProfile.personalWebsite}
                </p>
              </div>
            </Link>
          ) : (
            <div className="flex items-center space-x-3 rounded-lg border border-gray-700/30 bg-gray-800/30 p-3">
              <span className="text-purple-400">🌐</span>
              <div>
                <h3 className="font-semibold text-gray-300">Website</h3>
                <p className="text-sm text-gray-400">Not provided</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default CofoundrShowMore;
