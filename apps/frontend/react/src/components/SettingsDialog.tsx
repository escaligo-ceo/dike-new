import {
  AppItem,
  Dialog,
  DialogBody,
  DialogContent,
  DialogSurface,
  Input,
  NavCategory,
  NavCategoryItem,
  NavDivider,
  NavDrawer,
  NavDrawerBody,
  NavDrawerHeader,
  NavItem,
  NavSectionHeader,
  NavSubItem,
  NavSubItemGroup,
} from "@fluentui/react-components";
import React from "react";

import {
  Board20Filled,
  Board20Regular,
  BoxMultiple20Filled,
  BoxMultiple20Regular,
  DataArea20Filled,
  DataArea20Regular,
  Dismiss24Regular,
  DocumentBulletListMultiple20Filled,
  DocumentBulletListMultiple20Regular,
  HeartPulse20Filled,
  HeartPulse20Regular,
  MegaphoneLoud20Filled,
  MegaphoneLoud20Regular,
  NotePin20Filled,
  NotePin20Regular,
  People20Filled,
  People20Regular,
  PeopleStar20Filled,
  PeopleStar20Regular,
  Person20Filled,
  Person20Regular,
  PersonCircle32Regular,
  PersonLightbulb20Filled,
  PersonLightbulb20Regular,
  PersonSearch20Filled,
  PersonSearch20Regular,
  PreviewLink20Filled,
  PreviewLink20Regular,
  Search12Filled,
} from "@fluentui/react-icons";

import { bundleIcon } from "@fluentui/react-icons";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const isMultiple = false;
  const type = "inline";
  const linkDestination = "#";

  const Person = bundleIcon(Person20Filled, Person20Regular);
  const Dashboard = bundleIcon(Board20Filled, Board20Regular);
  const Announcements = bundleIcon(
    MegaphoneLoud20Filled,
    MegaphoneLoud20Regular
  );
  const EmployeeSpotlight = bundleIcon(
    PersonLightbulb20Filled,
    PersonLightbulb20Regular
  );
  const Search = bundleIcon(PersonSearch20Filled, PersonSearch20Regular);
  const PerformanceReviews = bundleIcon(
    PreviewLink20Filled,
    PreviewLink20Regular
  );
  const JobPostings = bundleIcon(NotePin20Filled, NotePin20Regular);
  const Interviews = bundleIcon(People20Filled, People20Regular);
  const HealthPlans = bundleIcon(HeartPulse20Filled, HeartPulse20Regular);
  const TrainingPrograms = bundleIcon(
    BoxMultiple20Filled,
    BoxMultiple20Regular
  );
  const CareerDevelopment = bundleIcon(PeopleStar20Filled, PeopleStar20Regular);
  const Analytics = bundleIcon(DataArea20Filled, DataArea20Regular);
  const Reports = bundleIcon(
    DocumentBulletListMultiple20Filled,
    DocumentBulletListMultiple20Regular
  );

  return (
    <>
      <style>
        {`
        .DialogContent {
          display: flex;
          height: 100%;
          padding: 0 !important;
          margin: 0 !important;
          background: white;
        }

        .left-sections {
          display: flex;
          flex-direction: row;
          width: 65%;
          height: 100%;
        }

        .gray-sections {
          display: flex;
          flex-direction: column;
          width: 45%;
          background: #e0e0e0;
        }

        .gray-sections > div {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: #e0e0e0;
          margin: 0;
          padding: 0;
        }

        .section-title {
          background: #d0d0d0;
          padding: 8px;
          font-weight: bold;
        }

        .section-content {
          flex: 1;
          padding: 8px;
        }

        .right-section {
          width: 35%;
          background: #f5f5f5;
          position: relative;
          padding: 16px;
        }

        .close-button {
          position: absolute;
          top: 8px;
          right: 8px;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 4px;
        }

        .close-button:hover {
          background: rgba(0,0,0,0.05);
          border-radius: 4px;
        }

				/* Bordo blu per la voce selezionata nel NavDrawer */
				.fui-NavItem[data-selected="true"],
				.fui-NavCategoryItem[data-selected="true"],
				.fui-NavSubItem[data-selected="true"] {
					border-left: 3px solid #0078d4 !important;
					background-color: rgba(0, 120, 212, 0.1);
					padding-left: calc(var(--fui-spacing-horizontal-m) - 3px);
				}
      `}
      </style>

      <Dialog open={open} onOpenChange={(_, data) => onOpenChange(data.open)}>
        <DialogSurface
          style={{
            maxWidth: "1200px",
            height: "calc(100vh - 80px)",
            padding: 0,
          }}
        >
          <DialogBody style={{ padding: 0, height: "100%" }}>
            <DialogContent
              className="DialogContent"
              style={{ padding: 0, margin: 0, height: "100%" }}
            >
              <div className="left-sections">
                <NavDrawer
                  defaultSelectedValue="2"
                  defaultSelectedCategoryValue=""
                  open={open}
                  type={type}
                  multiple={isMultiple}
                >
                  <NavDrawerHeader>
                    <h2 style={{ marginTop: "8px", marginBottom: "8px" }}>
                      Settings
                    </h2>

                    <Input
                      contentBefore={<Search12Filled />}
                      placeholder="Search..."
                      style={{ width: "100%" }}
                    />
                  </NavDrawerHeader>

                  <NavDrawerBody>
                    <AppItem
                      icon={<PersonCircle32Regular />}
                      as="a"
                      href={linkDestination}
                    >
                      Contoso HR
                    </AppItem>

                    <NavItem
                      href={linkDestination}
                      icon={<Dashboard />}
                      value="1"
                    >
                      Dashboard
                    </NavItem>

                    <NavItem
                      icon={<Announcements />}
                      href={linkDestination}
                      value="2"
                    >
                      Announcements
                    </NavItem>

                    <NavItem
                      icon={<EmployeeSpotlight />}
                      href={linkDestination}
                      value="3"
                    >
                      Employee Spotlight
                    </NavItem>

                    <NavItem
                      icon={<Search12Filled />}
                      href={linkDestination}
                      value="4"
                    >
                      Profile Search
                    </NavItem>

                    <NavItem
                      icon={<PerformanceReviews />}
                      href={linkDestination}
                      value="5"
                    >
                      Performance Reviews
                    </NavItem>

                    <NavSectionHeader>Employee Management</NavSectionHeader>

                    <NavCategory value="6">
                      <NavCategoryItem>Job Postings</NavCategoryItem>

                      <NavSubItemGroup>
                        <NavSubItem href={linkDestination} value="7">
                          Openings
                        </NavSubItem>

                        <NavSubItem href={linkDestination} value="8">
                          Submissions
                        </NavSubItem>
                      </NavSubItemGroup>
                    </NavCategory>

                    <NavItem value="9">Interviews</NavItem>

                    <NavSectionHeader>Benefits</NavSectionHeader>

                    <NavItem icon={<HealthPlans />} value="10">
                      Health Plans
                    </NavItem>

                    <NavCategory value="11">
                      <NavCategoryItem value="12">Retirement</NavCategoryItem>

                      <NavSubItemGroup>
                        <NavSubItem href={linkDestination} value="13">
                          Plan Information
                        </NavSubItem>

                        <NavSubItem href={linkDestination} value="14">
                          Fund Performance
                        </NavSubItem>
                      </NavSubItemGroup>
                    </NavCategory>

                    <NavSectionHeader>Learning</NavSectionHeader>

                    <NavItem icon={<TrainingPrograms />} value="15">
                      Training Programs
                    </NavItem>

                    <NavCategory value="16">
                      <NavCategoryItem value="17">
                        Career Development
                      </NavCategoryItem>

                      <NavSubItemGroup>
                        <NavSubItem href={linkDestination} value="17">
                          Career Paths
                        </NavSubItem>

                        <NavSubItem href={linkDestination} value="18">
                          Planning
                        </NavSubItem>
                      </NavSubItemGroup>
                    </NavCategory>

                    <NavDivider />

                    <NavItem target="_blank" value="19">
                      Workforce Data
                    </NavItem>

                    <NavItem href={linkDestination} value="20">
                      Reports
                    </NavItem>
                  </NavDrawerBody>
                </NavDrawer>

                <div className="gray-sections">
                  <div>
                    <div className="section-title">Sezione 1</div>
                    <div className="section-content">Contenuto 1</div>
                  </div>

                  <div>
                    <div className="section-title">Sezione 2</div>
                    <div className="section-content">Contenuto 2</div>
                  </div>
                </div>
              </div>

              <div className="right-section">
                <button
                  className="close-button"
                  onClick={() => onOpenChange(false)}
                >
                  <Dismiss24Regular />
                </button>
                Sezione chiara a destra
              </div>
            </DialogContent>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </>
  );
};
