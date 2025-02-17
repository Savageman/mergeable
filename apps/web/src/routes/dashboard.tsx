import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@blueprintjs/core";
import SectionDialog from "@/components/SectionDialog";
import DashboardSection from "@/components/DashboardSection";
import { SectionValue } from "@repo/types";
import { deleteSection, moveSectionDown, moveSectionUp, saveSection, toggleStar, useSections, usePulls } from "@/db";
import Navbar from "@/components/Navbar";

export default function Dashboard() {
    const sections = useSections();
    const pulls = usePulls();
    const pullsBySection = sections.data.map(section => pulls.data.filter(pull => pull.sections.indexOf(section.id) > -1));

    const [ isEditing, setEditing ] = useState(false);
    const [ searchParams, setSearchParams ] = useSearchParams();
    const [ newSection, setNewSection ] = useState<SectionValue>({label: "", search: "", notified: false});

    // Open a "New section" dialog if URL is a share link.
    useEffect(() => {
        if (searchParams.get("action") === "share") {
            setNewSection({
                label: searchParams.get("label") || "",
                search: searchParams.get("search") || "",
                notified: false,
            })
            setEditing(true)
        }
    }, [searchParams]);

    const handleSubmit = (value: SectionValue) => {
        saveSection({...value, id: "", position: sections.data.length});
        // Remove sharing parameters from URL if they were defined once the new section
        // has been created from those parameters.
        if (searchParams.get("action") === "share") {
            setSearchParams({});
        }
    }

    return (
        <>
            <Navbar>
                <Button text="New section" icon="plus" minimal onClick={() => setEditing(true)}/>
            </Navbar>
            <SectionDialog
                newSection={newSection}
                title="New section"
                isOpen={sections.isLoaded && isEditing}
                onClose={() => setEditing(false)}
                onSubmit={handleSubmit}/>
            {sections.isLoaded && sections.data.map((section, idx) => {
                return (
                    <DashboardSection
                        key={idx}
                        section={section}
                        isLoading={pulls.isLoading}
                        pulls={pullsBySection[idx]}
                        hasMore={false}
                        isFirst={idx === 0}
                        isLast={idx === sections.data.length - 1}
                        onChange={saveSection}
                        onDelete={() => deleteSection(section)}
                        onMoveUp={() => moveSectionUp(section)}
                        onMoveDown={() => moveSectionDown(section)}
                        onStar={toggleStar}/>
                )
            })}
        </>
    )
}
