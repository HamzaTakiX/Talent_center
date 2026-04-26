import { FunctionComponent, useState } from 'react';
import { Download, Save } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import SectionBadge from './SectionBadge';

/**
 * Map of CV-section keys (matching how this template lays out content) to
 * AI suggestion text. Pass null/undefined to hide a badge for a section.
 * The keys mirror the canonical SectionType values from cv_builder, plus
 * 'header' and 'summary' for the name/title and About Me blocks.
 */
export interface SectionSuggestionMap {
  header?: string;
  summary?: string;
  skills?: string;
  education?: string;
  experience?: string;
  references?: string;
}

interface CvData {
  name: string;
  title: string;
  about: string;
  skills: string[];
  education: Array<{
    degree: string;
    school: string;
    date: string;
    description: string;
  }>;
  experience: Array<{
    title: string;
    company: string;
    date: string;
    description: string;
  }>;
  references: Array<{
    name: string;
    title: string;
    phone: string;
    email: string;
  }>;
}

interface StandardCvTemplateProps {
  accentColor?: string;
  onAccentColorChange?: (color: string) => void;
  sectionSuggestions?: SectionSuggestionMap;
}

const StandardCvTemplate: FunctionComponent<StandardCvTemplateProps> = ({
  accentColor = '#e96f00',
  onAccentColorChange,
  sectionSuggestions = {},
}) => {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [cvData, setCvData] = useState<CvData>({
    name: 'Connor\nHamilton',
    title: 'Marketing Manager',
    about: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    skills: [
      'Management Skills',
      'Creativity',
      'Digital Marketing',
      'Negotiation',
      'Critical Thinking',
      'Leadership',
    ],
    education: [
      {
        degree: 'Bachelor of Business Management',
        school: 'Borcelle University',
        date: '2016 - 2020',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc sit amet sem nec risus egestas accumsan.',
      },
      {
        degree: 'Bachelor of Business Management',
        school: 'Borcelle University',
        date: '2020 - 2023',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc sit amet sem nec risus egestas accumsan.',
      },
    ],
    experience: [
      {
        title: 'Product Design Manager',
        company: 'Arowwai Industries',
        date: '2016 - 2020',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      },
      {
        title: 'Marketing Manager',
        company: 'Arowwai Industries',
        date: '2019 - 2020',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      },
      {
        title: 'Marketing Manager',
        company: 'Arowwai Industries',
        date: '2017 - 2019',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      },
      {
        title: 'Marketing Manager',
        company: 'Arowwai Industries',
        date: '2016 - 2017',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      },
    ],
    references: [
      {
        name: 'Harumi Kobayashi',
        title: 'Wardiere Inc. / CEO',
        phone: '123-456-7890',
        email: 'hello@reallygreatsite.com',
      },
      {
        name: 'Bailey Dupont',
        title: 'Wardiere Inc. / CEO',
        phone: '123-456-7890',
        email: 'hello@reallygreatsite.com',
      },
    ],
  });

  const [editingField, setEditingField] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
        setImagePosition({ x: 0, y: 0, scale: 1 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!profileImage) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !profileImage) return;
    setImagePosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
      scale: imagePosition.scale,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!profileImage) return;
    e.preventDefault();
    const newScale = imagePosition.scale + (e.deltaY > 0 ? -0.1 : 0.1);
    setImagePosition({
      ...imagePosition,
      scale: Math.max(0.5, Math.min(3, newScale)),
    });
  };

  const handleFieldEdit = (field: string, value: string) => {
    setCvData((prev) => ({ ...prev, [field]: value }));
  };

  const handleArrayFieldEdit = (field: keyof CvData, index: number, value: string) => {
    setCvData((prev) => {
      const newArray = [...(prev[field] as any[])];
      newArray[index] = value;
      return { ...prev, [field]: newArray };
    });
  };

  const handleObjectFieldEdit = (
    field: keyof CvData,
    index: number,
    subField: string,
    value: string
  ) => {
    setCvData((prev) => {
      const newArray = [...(prev[field] as any[])];
      newArray[index] = { ...newArray[index], [subField]: value };
      return { ...prev, [field]: newArray };
    });
  };

  const exportToPDF = async () => {
    const element = document.getElementById('cv-template');
    if (element) {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('cv-template.pdf');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 bg-gray-100 overflow-auto flex items-start justify-center p-8">
        <div
          id="cv-template"
          className="bg-white shadow-lg"
          style={{
            width: '794px',
            height: '1123px',
            display: 'grid',
            gridTemplateColumns: '280px 1fr',
            padding: '48px 50px',
            gap: '42px',
            fontFamily: 'Montserrat, Arial, sans-serif',
            color: '#111',
          }}
        >
          {/* LEFT COLUMN */}
          <div className="cv-left" style={{ paddingTop: '5px' }}>
            <div
              className="photo-wrapper"
              style={{
                width: '205px',
                height: '285px',
                position: 'relative',
                marginBottom: '45px',
              }}
            >
              <div
                className="orange-shape"
                style={{
                  position: 'absolute',
                  width: '160px',
                  height: '150px',
                  right: '-18px',
                  bottom: '-18px',
                  background: accentColor,
                  borderRadius: '0 34px 18px 34px',
                  zIndex: 1,
                  pointerEvents: 'none',
                }}
              />
              <div
                className="profile-img"
                style={{
                  position: 'relative',
                  zIndex: 2,
                  width: '205px',
                  height: '285px',
                  objectFit: 'cover',
                  borderRadius: '28px 70px 18px 18px',
                  display: 'block',
                  background: profileImage ? 'transparent' : '#e0e0e0',
                  backgroundImage: profileImage ? `url(${profileImage})` : 'none',
                  backgroundSize: `${205 * imagePosition.scale}px ${285 * imagePosition.scale}px`,
                  backgroundPosition: `${102.5 + imagePosition.x}px ${142.5 + imagePosition.y}px`,
                  pointerEvents: profileImage ? 'auto' : 'none',
                  cursor: profileImage ? 'move' : 'default',
                  overflow: 'hidden',
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
              />
              {!profileImage && (
                <label
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 3,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#666',
                  }}
                >
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span style={{ fontSize: '12px', fontWeight: 500 }}>Upload Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              )}
              {profileImage && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setProfileImage(null);
                    }}
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      zIndex: 3,
                      background: 'rgba(0,0,0,0.6)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '30px',
                      height: '30px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    ×
                  </button>
                  <label
                    style={{
                      position: 'absolute',
                      bottom: '10px',
                      right: '10px',
                      zIndex: 3,
                      background: 'rgba(0,0,0,0.6)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '30px',
                      height: '30px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                </>
              )}
            </div>

            {sectionSuggestions.header && (
              <div style={{ marginBottom: '10px' }}>
                <SectionBadge message={sectionSuggestions.header} />
              </div>
            )}
            <h1
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => handleFieldEdit('name', e.currentTarget.innerText)}
              style={{
                fontSize: '43px',
                lineHeight: '0.95',
                fontWeight: 500,
                margin: '0 0 8px',
                letterSpacing: '-1.5px',
                whiteSpace: 'pre-line',
              }}
            >
              {cvData.name}
            </h1>

            <p
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => handleFieldEdit('title', e.currentTarget.innerText)}
              style={{
                fontSize: '17px',
                margin: '0 0 32px',
                color: '#333',
              }}
            >
              {cvData.title}
            </p>

            <div className="side-section" style={{ marginBottom: '36px' }}>
              {sectionSuggestions.summary && (
                <div style={{ marginBottom: '10px' }}>
                  <SectionBadge message={sectionSuggestions.summary} />
                </div>
              )}
              <h2
                style={{
                  fontSize: '22px',
                  margin: '0 0 18px',
                  fontWeight: 700,
                  paddingBottom: '10px',
                  borderBottom: '2px solid #777',
                }}
              >
                About Me
              </h2>
              <p
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleFieldEdit('about', e.currentTarget.innerText)}
                style={{
                  fontSize: '13px',
                  lineHeight: '1.65',
                  textAlign: 'justify',
                  margin: 0,
                  color: '#333',
                }}
              >
                {cvData.about}
              </p>
            </div>

            <div className="side-section" style={{ marginBottom: '36px' }}>
              {sectionSuggestions.skills && (
                <div style={{ marginBottom: '10px' }}>
                  <SectionBadge message={sectionSuggestions.skills} />
                </div>
              )}
              <h2
                style={{
                  fontSize: '22px',
                  margin: '0 0 18px',
                  fontWeight: 700,
                  paddingBottom: '10px',
                  borderBottom: '2px solid #777',
                }}
              >
                Skills
              </h2>
              <ul style={{ paddingLeft: '20px', margin: 0 }}>
                {cvData.skills.map((skill, index) => (
                  <li
                    key={index}
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => handleArrayFieldEdit('skills', index, e.currentTarget.innerText)}
                    style={{
                      fontSize: '13px',
                      marginBottom: '14px',
                      fontWeight: 500,
                    }}
                  >
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="cv-right" style={{ paddingTop: '25px' }}>
            <div className="main-section" style={{ marginBottom: '42px' }}>
              {sectionSuggestions.education && (
                <div style={{ marginBottom: '10px' }}>
                  <SectionBadge message={sectionSuggestions.education} />
                </div>
              )}
              <h2
                style={{
                  fontSize: '22px',
                  marginBottom: '22px',
                  fontWeight: 700,
                  paddingBottom: '10px',
                  borderBottom: '2px solid #777',
                }}
              >
                Education
              </h2>

              <div className="timeline" style={{ position: 'relative', paddingLeft: '22px' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: '4px',
                    top: '4px',
                    bottom: '5px',
                    width: '1.5px',
                    background: '#333',
                  }}
                />
                {cvData.education.map((edu, index) => (
                  <div key={index} className="timeline-item" style={{ position: 'relative', marginBottom: '27px' }}>
                    <div
                      style={{
                        width: '9px',
                        height: '9px',
                        background: '#000',
                        borderRadius: '50%',
                        position: 'absolute',
                        left: '-22px',
                        top: '2px',
                        zIndex: 2,
                      }}
                    />
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '20px',
                        marginBottom: '6px',
                      }}
                    >
                      <div>
                        <h3
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => handleObjectFieldEdit('education', index, 'degree', e.currentTarget.innerText)}
                          style={{ fontSize: '14px', margin: 0, fontWeight: 700 }}
                        >
                          {edu.degree}
                        </h3>
                        <h4
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => handleObjectFieldEdit('education', index, 'school', e.currentTarget.innerText)}
                          style={{ fontSize: '12px', margin: '1px 0 0', fontStyle: 'italic', fontWeight: 600 }}
                        >
                          {edu.school}
                        </h4>
                      </div>
                    </div>
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => handleObjectFieldEdit('education', index, 'date', e.currentTarget.innerText)}
                      style={{ fontSize: '11px', whiteSpace: 'nowrap', marginTop: '8px', display: 'block' }}
                    >
                      {edu.date}
                    </span>
                    <p
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => handleObjectFieldEdit('education', index, 'description', e.currentTarget.innerText)}
                      style={{ fontSize: '11.5px', lineHeight: '1.45', margin: 0, color: '#333', textAlign: 'justify' }}
                    >
                      {edu.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="main-section" style={{ marginBottom: '42px' }}>
              {sectionSuggestions.experience && (
                <div style={{ marginBottom: '10px' }}>
                  <SectionBadge message={sectionSuggestions.experience} />
                </div>
              )}
              <h2
                style={{
                  fontSize: '22px',
                  marginBottom: '22px',
                  fontWeight: 700,
                  paddingBottom: '10px',
                  borderBottom: '2px solid #777',
                }}
              >
                Experience
              </h2>

              <div className="timeline" style={{ position: 'relative', paddingLeft: '22px' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: '4px',
                    top: '4px',
                    bottom: '5px',
                    width: '1.5px',
                    background: '#333',
                  }}
                />
                {cvData.experience.map((exp, index) => (
                  <div key={index} className="timeline-item" style={{ position: 'relative', marginBottom: '27px' }}>
                    <div
                      style={{
                        width: '9px',
                        height: '9px',
                        background: '#000',
                        borderRadius: '50%',
                        position: 'absolute',
                        left: '-22px',
                        top: '2px',
                        zIndex: 2,
                      }}
                    />
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '20px',
                        marginBottom: '6px',
                      }}
                    >
                      <div>
                        <h3
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => handleObjectFieldEdit('experience', index, 'title', e.currentTarget.innerText)}
                          style={{ fontSize: '14px', margin: 0, fontWeight: 700 }}
                        >
                          {exp.title}
                        </h3>
                        <h4
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => handleObjectFieldEdit('experience', index, 'company', e.currentTarget.innerText)}
                          style={{ fontSize: '12px', margin: '1px 0 0', fontStyle: 'italic', fontWeight: 600 }}
                        >
                          {exp.company}
                        </h4>
                      </div>
                    </div>
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => handleObjectFieldEdit('experience', index, 'date', e.currentTarget.innerText)}
                      style={{ fontSize: '11px', whiteSpace: 'nowrap', marginTop: '8px', display: 'block' }}
                    >
                      {exp.date}
                    </span>
                    <p
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => handleObjectFieldEdit('experience', index, 'description', e.currentTarget.innerText)}
                      style={{ fontSize: '11.5px', lineHeight: '1.45', margin: 0, color: '#333', textAlign: 'justify' }}
                    >
                      {exp.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="main-section references" style={{ marginTop: '6px' }}>
              {sectionSuggestions.references && (
                <div style={{ marginBottom: '10px' }}>
                  <SectionBadge message={sectionSuggestions.references} />
                </div>
              )}
              <h2
                style={{
                  fontSize: '22px',
                  marginBottom: '22px',
                  fontWeight: 700,
                  paddingBottom: '10px',
                  borderBottom: '2px solid #777',
                }}
              >
                References
              </h2>

              <div className="refs-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '35px' }}>
                {cvData.references.map((ref, index) => (
                  <div key={index}>
                    <h3
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => handleObjectFieldEdit('references', index, 'name', e.currentTarget.innerText)}
                      style={{ fontSize: '15px', margin: '0 0 2px', fontWeight: 800 }}
                    >
                      {ref.name}
                    </h3>
                    <p
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => handleObjectFieldEdit('references', index, 'title', e.currentTarget.innerText)}
                      style={{ fontSize: '12px', margin: '0 0 9px' }}
                    >
                      {ref.title}
                    </p>
                    <small
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => handleObjectFieldEdit('references', index, 'phone', e.currentTarget.innerText)}
                      style={{ display: 'block', fontSize: '9.5px', marginBottom: '3px' }}
                    >
                      <b>Phone:</b> {ref.phone}
                    </small>
                    <small
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => handleObjectFieldEdit('references', index, 'email', e.currentTarget.innerText)}
                      style={{ display: 'block', fontSize: '9.5px', marginBottom: '3px' }}
                    >
                      <b>Email:</b> {ref.email}
                    </small>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StandardCvTemplate;
