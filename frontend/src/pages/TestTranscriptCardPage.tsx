import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Pagination } from '@trussworks/react-uswds';
import { CmmTranscriptCard, type CmmTranscriptCardProps } from '../components/cards/CmmTranscriptCard';

const ITEMS_PER_PAGE = 5;

// Generate a larger mock dataset for pagination
const mockTranscriptData: CmmTranscriptCardProps[] = Array.from({ length: 23 }, (_, i) => {
    const speaker = i % 2 === 0 ? 'Interviewer' : 'Guest';
    const time = new Date(i * 5000).toISOString().substr(14, 8);
    return {
        timestamp: time,
        speaker: speaker,
        text: `This is transcript segment number ${i + 1}. The content here serves as a placeholder to demonstrate the pagination functionality and how it handles multiple items across several pages.`,
    };
});

export const TestTranscriptCardPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [currentPage, setCurrentPage] = useState(1);
    const [isInvalidPage, setIsInvalidPage] = useState(false);

    const totalPages = Math.ceil(mockTranscriptData.length / ITEMS_PER_PAGE);

    // Sync state from URL search params
    useEffect(() => {
        const pageFromUrl = parseInt(searchParams.get('page') || '1', 10);
        
        if (!isNaN(pageFromUrl) && pageFromUrl > 0 && pageFromUrl <= totalPages) {
            setCurrentPage(pageFromUrl);
            setIsInvalidPage(false);
        } else {
            // Set invalid state instead of redirecting
            setCurrentPage(1); // Keep internal current page at 1 for consistency, but render invalid message
            setIsInvalidPage(true);
        }
    }, [searchParams, totalPages, setSearchParams]);

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentItems = mockTranscriptData.slice(startIndex, endIndex);

    return (
        <div className="grid-container padding-y-4">
            <div className="bg-white padding-4 radius-lg border border-base-lighter shadow-1">
                <h1 className="font-heading-xl margin-top-0">Transcript Cards Test Page</h1>
                <p className="usa-intro text-base-dark">
                    Displaying paginated `CmmTranscriptCard` components within the application context.
                </p>

                {isInvalidPage ? (
                    <div className="margin-top-4 text-center">
                        <p className="text-error font-body-lg">
                            Page Not Found or Invalid. Please go back to a valid page.
                        </p>
                        <Pagination
                            currentPage={1} // Always show page 1 in controls for an invalid state
                            totalPages={totalPages}
                            pathname="/transcript"
                        />
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col gap-2 margin-top-4">
                            {currentItems.map((item) => (
                                <CmmTranscriptCard key={item.timestamp} {...item} />
                            ))}
                        </div>

                        <div className="margin-top-4">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                pathname="/transcript"
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};