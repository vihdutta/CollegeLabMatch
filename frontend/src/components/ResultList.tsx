import React, { useState } from "react";
import { Lab } from "../api";

interface ResultListProps {
  labs: Lab[];
  processingTime: number;
}

export default function ResultList({ labs, processingTime }: ResultListProps) {
  const [expandedLabs, setExpandedLabs] = useState<Set<number>>(new Set());

  if (labs.length === 0) return null;

  const toggleExpanded = (labId: number) => {
    const newExpanded = new Set(expandedLabs);
    if (newExpanded.has(labId)) {
      newExpanded.delete(labId);
    } else {
      newExpanded.add(labId);
    }
    setExpandedLabs(newExpanded);
  };

  const truncateText = (text: string, maxLength: number = 200) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className="animate-fade-in">
      {/* Results Grid */}
      <div className="grid gap-8 md:gap-6 lg:grid-cols-2">
        {labs.map((lab, index) => {
          const isExpanded = expandedLabs.has(lab.id);
          const shouldTruncate = lab.summary.length > 200;

          return (
            <article
              key={lab.id}
              className="bg-gradient-to-br from-white to-sage-light rounded-xl shadow-elegant hover:shadow-elegant-lg transition-all duration-300 p-6 group border-2 border-sage/30 hover:border-primary-red/30"
              itemScope
              itemType="https://schema.org/ResearchProject"
            >
              {" "}
              {/* Lab Header */}{" "}
              <header className="mb-4">
                {" "}
                <div className="flex justify-between items-start mb-3">
                  {" "}
                  <div className="flex-1">
                    {" "}
                    <h2
                      className="text-xl font-serif font-bold text-dark-green mb-2 group-hover:text-primary-red transition-colors duration-200"
                      itemProp="name"
                    >
                      {" "}
                      {lab.name}{" "}
                    </h2>{" "}
                    <div className="flex flex-wrap gap-2 text-sm text-dark-green/70">
                      {" "}
                      <span>
                        {" "}
                        <span className="font-medium">PI:</span>{" "}
                        <span itemProp="director">{lab.pi}</span>{" "}
                      </span>{" "}
                      <span className="text-primary-red">•</span>{" "}
                      <span itemProp="affiliation">{lab.university}</span>{" "}
                    </div>{" "}
                  </div>{" "}
                  {/* Match Score Badge */}{" "}
                  <div
                    className="flex flex-col items-end"
                    role="img"
                    aria-label={`Match score: ${(
                      lab.similarity_score * 100
                    ).toFixed(1)} percent`}
                  >
                    {" "}
                    <span className="text-xs text-dark-green/60 mb-1 font-medium">
                      {" "}
                      Match Score{" "}
                    </span>{" "}
                    <div className="bg-gradient-to-r from-primary-red to-primary-red-light text-white px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                      {" "}
                      {(lab.similarity_score * 100).toFixed(1)}%{" "}
                    </div>{" "}
                  </div>{" "}
                </div>
                {/* Rank Badge */}{" "}
                <div className="flex justify-between items-center">
                  {" "}
                  <span
                    className="inline-flex items-center bg-primary-red/10 text-primary-red px-2 py-1 rounded-md text-xs font-medium border border-primary-red/20"
                    aria-label={`Ranked number ${index + 1} out of ${
                      labs.length
                    } results`}
                  >
                    {" "}
                    <svg
                      className="w-3 h-3 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      {" "}
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />{" "}
                    </svg>{" "}
                    Rank #{index + 1}{" "}
                  </span>{" "}
                </div>{" "}
              </header>{" "}
              {/* Lab Summary */}{" "}
              <div className="mb-6">
                {" "}
                <p
                  className="text-dark-green/80 leading-relaxed"
                  itemProp="description"
                >
                  {" "}
                  {isExpanded || !shouldTruncate
                    ? lab.summary
                    : truncateText(lab.summary)}{" "}
                </p>{" "}
                {shouldTruncate && (
                  <button
                    onClick={() => toggleExpanded(lab.id)}
                    className="text-primary-red hover:text-primary-red-light font-medium text-sm mt-2 focus:outline-none focus:ring-2 focus:ring-primary-red/20 rounded-md px-1 transition-colors duration-200"
                    aria-expanded={isExpanded}
                    aria-controls={`lab-summary-${lab.id}`}
                  >
                    {" "}
                    {isExpanded ? "Show less" : "Read more"}{" "}
                    <svg
                      className={`w-4 h-4 inline ml-1 transition-transform duration-200 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {" "}
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />{" "}
                    </svg>{" "}
                  </button>
                )}{" "}
              </div>
              {/* Actions */}{" "}
              <footer className="flex justify-between items-center pt-4 border-t border-sage/30">
                {" "}
                <a
                  href={`mailto:${lab.email}?subject=Research Opportunity Inquiry - ${lab.name}&body=Dear Dr. ${lab.pi},%0D%0A%0D%0AI am interested in learning more about research opportunities in your lab.%0D%0A%0D%0ABest regards`}
                  className="inline-flex items-center bg-primary-red hover:bg-primary-red-light text-white font-medium px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-glow focus:outline-none focus:ring-2 focus:ring-primary-red/50 shadow-sm"
                  itemProp="contactPoint"
                  aria-describedby={`contact-${lab.id}`}
                >
                  {" "}
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {" "}
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />{" "}
                  </svg>{" "}
                  Contact Lab{" "}
                </a>{" "}
              </footer>
              {/* Hidden descriptive text for screen readers */}
              <div id={`contact-${lab.id}`} className="sr-only">
                Contact the {lab.name} lab led by {lab.pi} at {lab.university}
              </div>
            </article>
          );
        })}
      </div>
      {/* Summary Stats */}{" "}
      <div className="mt-12 text-center">
        {" "}
        <div className="inline-flex items-center bg-sage-light/40 rounded-xl px-8 py-6 space-x-8 border border-sage/30 shadow-elegant">
          {" "}
          <div className="text-center">
            {" "}
            <div className="text-2xl font-bold text-primary-red">
              {labs.length}
            </div>{" "}
            <div className="text-sm text-dark-green/70 font-medium">
              Labs Found
            </div>{" "}
          </div>{" "}
          <div className="w-px h-10 bg-primary-red/30"></div>{" "}
          <div className="text-center">
            {" "}
            <div className="text-2xl font-bold text-primary-red">
              {processingTime.toFixed(2)}s
            </div>{" "}
            <div className="text-sm text-dark-green/70 font-medium">
              Search Time
            </div>{" "}
          </div>{" "}
          <div className="w-px h-10 bg-primary-red/30"></div>{" "}
          <div className="text-center">
            {" "}
            <div className="text-2xl font-bold text-primary-red">
              {" "}
              {labs.length > 0
                ? (labs[0].similarity_score * 100).toFixed(0)
                : 0}
              %{" "}
            </div>{" "}
            <div className="text-sm text-dark-green/70 font-medium">
              Top Match
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </div>
    </div>
  );
}
