function extractEventDetails(starredMail) {
    const { subject, body, date: emailDate } = starredMail;

    // Combine subject and body for analysis
    const text = `${subject}\n${body}`;

    // Regex patterns for common date formats
    const datePatterns = [
        /\b(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})\b/g, // 10/12/2023
        /\b(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{2,4})\b/gi, // 10 Oct 2023
        /\b(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b/gi,
    ];

    // Regex for time
    const timePatterns = [
        /\b(\d{1,2}):(\d{2})\s*(AM|PM)?\b/gi,
        /\b(\d{1,2})\s*(AM|PM)\b/gi,
    ];

    let foundDate = null;
    let foundTime = null;

    // Simple extraction logic - in a real app, you might use an LLM or a library like 'chrono-node'
    // For this agent, we'll try to find the first occurrence that looks like a date/time

    for (const pattern of datePatterns) {
        const match = text.match(pattern);
        if (match) {
            foundDate = match[0];
            break;
        }
    }

    for (const pattern of timePatterns) {
        const match = text.match(pattern);
        if (match) {
            foundTime = match[0];
            break;
        }
    }

    // Fallback to email date if no date found in body
    if (!foundDate) {
        foundDate = emailDate;
        console.log('No date found in body, falling back to email header date:', emailDate);
    } else {
        console.log('Detected date in body:', foundDate);
    }

    if (foundTime) {
        console.log('Detected time in body:', foundTime);
    }

    // Construct summary
    let summary = subject;
    if (text.toLowerCase().includes('interview')) {
        summary = `Interview: ${subject}`;
    } else if (text.toLowerCase().includes('placement')) {
        summary = `Placement Drive: ${subject}`;
    }

    // For startDateTime, we need to combine foundDate and foundTime into an ISO string
    // This is a simplified version. A real parser would be much more complex.
    const now = new Date();
    let startDateTime = now.toISOString();

    try {
        if (foundDate && foundTime) {
            const combined = new Date(`${foundDate} ${foundTime}`);
            if (!isNaN(combined.getTime())) {
                startDateTime = combined.toISOString();
            }
        } else if (foundDate) {
            const combined = new Date(foundDate);
            if (!isNaN(combined.getTime())) {
                // Default to 10 AM if only date is found
                combined.setHours(10, 0, 0);
                startDateTime = combined.toISOString();
            }
        }
    } catch (e) {
        console.error("Date parsing error", e);
    }

    // End date is usually 1 hour after start
    const end = new Date(startDateTime);
    end.setHours(end.getHours() + 1);
    const endDateTime = end.toISOString();

    console.log('Final Event Start:', startDateTime);
    console.log('Final Event End:', endDateTime);

    return {
        summary,
        description: body.substring(0, 500) + '...',
        startDateTime,
        endDateTime,
        originalDateStr: foundDate,
        originalTimeStr: foundTime
    };
}

module.exports = {
    extractEventDetails,
};
