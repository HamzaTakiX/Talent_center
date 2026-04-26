import { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Stage, Layer, Rect, Circle, Text, Image as KonvaImage, Transformer, Line } from 'react-konva';
import Konva from 'konva';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface CanvasElement {
  id: string;
  type: 'text' | 'rect' | 'circle' | 'image' | 'line';
  x: number;
  y: number;
  width?: number;
  height?: number;
  fill?: string;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontStyle?: string;
  image?: HTMLImageElement;
  points?: number[];
  stroke?: string;
  strokeWidth?: number;
  cornerRadius?: number | number[];
}

interface CanvasEditorProps {
  onSave?: (dataUrl: string) => void;
  onDownloadPDF?: () => void;
  editorRef?: React.RefObject<{
    addText: () => void;
    addRect: () => void;
    addCircle: () => void;
    addImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
    deleteSelected: () => void;
    saveCanvas: () => void;
    exportToPDF: () => void;
  }>;
}

const CanvasEditor = forwardRef<
  {
    addText: () => void;
    addRect: () => void;
    addCircle: () => void;
    addImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
    deleteSelected: () => void;
    saveCanvas: () => void;
    exportToPDF: () => void;
  },
  CanvasEditorProps
>(({ onSave, onDownloadPDF }, ref) => {
  const [elements, setElements] = useState<CanvasElement[]>([
    // Left sidebar orange shape with custom border radius
    {
      id: 'orange-shape',
      type: 'rect',
      x: 230,
      y: 50,
      width: 160,
      height: 150,
      fill: '#e96f00',
      cornerRadius: [0, 34, 18, 34],
    },
    // Photo placeholder with custom border radius
    {
      id: 'photo-placeholder',
      type: 'rect',
      x: 50,
      y: 50,
      width: 205,
      height: 285,
      fill: '#e0e0e0',
      cornerRadius: [28, 70, 18, 18],
    },
    // Name
    {
      id: 'name',
      type: 'text',
      x: 50,
      y: 360,
      text: 'Connor\nHamilton',
      fontSize: 43,
      fontFamily: 'Montserrat, Arial',
      fontStyle: 'bold',
    },
    // Job title
    {
      id: 'job-title',
      type: 'text',
      x: 50,
      y: 410,
      text: 'Marketing Manager',
      fontSize: 17,
      fontFamily: 'Montserrat, Arial',
      fontStyle: 'normal',
    },
    // About Me section
    {
      id: 'about-title',
      type: 'text',
      x: 50,
      y: 460,
      text: 'About Me',
      fontSize: 22,
      fontFamily: 'Montserrat, Arial',
      fontStyle: 'bold',
    },
    {
      id: 'about-underline',
      type: 'line',
      x: 50,
      y: 485,
      points: [50, 485, 280, 485],
      stroke: '#777',
      strokeWidth: 2,
    },
    {
      id: 'about-text',
      type: 'text',
      x: 50,
      y: 500,
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      fontSize: 13,
      fontFamily: 'Montserrat, Arial',
      fontStyle: 'normal',
    },
    // Skills section
    {
      id: 'skills-title',
      type: 'text',
      x: 50,
      y: 580,
      text: 'Skills',
      fontSize: 22,
      fontFamily: 'Montserrat, Arial',
      fontStyle: 'bold',
    },
    {
      id: 'skills-underline',
      type: 'line',
      x: 50,
      y: 605,
      points: [50, 605, 280, 605],
      stroke: '#777',
      strokeWidth: 2,
    },
    {
      id: 'skill-1',
      type: 'text',
      x: 50,
      y: 625,
      text: '• Management Skills',
      fontSize: 13,
      fontFamily: 'Montserrat, Arial',
      fontStyle: 'normal',
    },
    {
      id: 'skill-2',
      type: 'text',
      x: 50,
      y: 645,
      text: '• Creativity',
      fontSize: 13,
      fontFamily: 'Montserrat, Arial',
      fontStyle: 'normal',
    },
    {
      id: 'skill-3',
      type: 'text',
      x: 50,
      y: 665,
      text: '• Digital Marketing',
      fontSize: 13,
      fontFamily: 'Montserrat, Arial',
      fontStyle: 'normal',
    },
    {
      id: 'skill-4',
      type: 'text',
      x: 50,
      y: 685,
      text: '• Negotiation',
      fontSize: 13,
      fontFamily: 'Montserrat, Arial',
      fontStyle: 'normal',
    },
    {
      id: 'skill-5',
      type: 'text',
      x: 50,
      y: 705,
      text: '• Critical Thinking',
      fontSize: 13,
      fontFamily: 'Montserrat, Arial',
      fontStyle: 'normal',
    },
    {
      id: 'skill-6',
      type: 'text',
      x: 50,
      y: 725,
      text: '• Leadership',
      fontSize: 13,
      fontFamily: 'Montserrat, Arial',
      fontStyle: 'normal',
    },
    // Right column - Education
    {
      id: 'education-title',
      type: 'text',
      x: 330,
      y: 50,
      text: 'Education',
      fontSize: 22,
      fontFamily: 'Montserrat, Arial',
      fontStyle: 'bold',
    },
    {
      id: 'education-underline',
      type: 'line',
      x: 330,
      y: 75,
      points: [330, 75, 750, 75],
      stroke: '#777',
      strokeWidth: 2,
    },
    {
      id: 'edu-1-title',
      type: 'text',
      x: 355,
      y: 90,
      text: 'Bachelor of Business Management',
      fontSize: 14,
      fontFamily: 'Montserrat, Arial',
      fontStyle: 'bold',
    },
    {
      id: 'edu-1-school',
      type: 'text',
      x: 355,
      y: 110,
      text: 'Borcelle University',
      fontSize: 12,
      fontFamily: 'Montserrat, Arial',
      fontStyle: 'italic',
    },
    {
      id: 'edu-1-date',
      type: 'text',
      x: 600,
      y: 90,
      text: '2016 - 2020',
      fontSize: 11,
      fontFamily: 'Montserrat, Arial',
      fontStyle: 'normal',
    },
    {
      id: 'edu-1-desc',
      type: 'text',
      x: 355,
      y: 130,
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      fontSize: 11.5,
      fontFamily: 'Montserrat, Arial',
      fontStyle: 'normal',
    },
    {
      id: 'edu-2-title',
      type: 'text',
      x: 355,
      y: 170,
      text: 'Bachelor of Business Management',
      fontSize: 14,
      fontFamily: 'Montserrat, Arial',
      fontStyle: 'bold',
    },
    {
      id: 'edu-2-school',
      type: 'text',
      x: 355,
      y: 190,
      text: 'Borcelle University',
      fontSize: 12,
      fontFamily: 'Montserrat, Arial',
      fontStyle: 'italic',
    },
    {
      id: 'edu-2-date',
      type: 'text',
      x: 600,
      y: 170,
      text: '2020 - 2023',
      fontSize: 11,
      fontFamily: 'Montserrat, Arial',
      fontStyle: 'normal',
    },
    {
      id: 'edu-2-desc',
      type: 'text',
      x: 355,
      y: 210,
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      fontSize: 11.5,
      fontFamily: 'Montserrat, Arial',
      fontStyle: 'normal',
    },
    // Experience section
    {
      id: 'experience-title',
      type: 'text',
      x: 330,
      y: 260,
      text: 'Experience',
      fontSize: 22,
      fontFamily: 'Montserrat, Arial',
      fontStyle: 'bold',
    },
    {
      id: 'experience-underline',
      type: 'line',
      x: 330,
      y: 285,
      points: [330, 285, 750, 285],
      stroke: '#777',
      strokeWidth: 2,
    },
    // Timeline vertical line
    {
      id: 'timeline-line',
      type: 'line',
      x: 334,
      y: 295,
      points: [334, 295, 334, 460],
      stroke: '#333',
      strokeWidth: 1.5,
    },
    // Timeline dots
    {
      id: 'timeline-dot-1',
      type: 'circle',
      x: 334,
      y: 302,
      width: 9,
      height: 9,
      fill: '#000',
    },
    {
      id: 'timeline-dot-2',
      type: 'circle',
      x: 334,
      y: 382,
      width: 9,
      height: 9,
      fill: '#000',
    },
    {
      id: 'exp-1-title',
      type: 'text',
      x: 355,
      y: 300,
      text: 'Product Design Manager',
      fontSize: 14,
      fontFamily: 'Montserrat, Arial',
      fontStyle: 'bold',
    },
    {
      id: 'exp-1-company',
      type: 'text',
      x: 355,
      y: 320,
      text: 'Arowwai Industries',
      fontSize: 12,
      fontFamily: 'Montserrat, Arial',
      fontStyle: 'italic',
    },
    {
      id: 'exp-1-date',
      type: 'text',
      x: 600,
      y: 300,
      text: '2016 - 2020',
      fontSize: 11,
      fontFamily: 'Montserrat, Arial',
      fontStyle: 'normal',
    },
    {
      id: 'exp-1-desc',
      type: 'text',
      x: 355,
      y: 340,
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      fontSize: 11.5,
      fontFamily: 'Montserrat, Arial',
      fontStyle: 'normal',
    },
    {
      id: 'exp-2-title',
      type: 'text',
      x: 355,
      y: 380,
      text: 'Marketing Manager',
      fontSize: 14,
      fontFamily: 'Montserrat, Arial',
      fontStyle: 'bold',
    },
    {
      id: 'exp-2-company',
      type: 'text',
      x: 355,
      y: 400,
      text: 'Arowwai Industries',
      fontSize: 12,
      fontFamily: 'Montserrat, Arial',
      fontStyle: 'italic',
    },
    {
      id: 'exp-2-date',
      type: 'text',
      x: 600,
      y: 380,
      text: '2019 - 2020',
      fontSize: 11,
      fontFamily: 'Montserrat, Arial',
      fontStyle: 'normal',
    },
    {
      id: 'exp-2-desc',
      type: 'text',
      x: 355,
      y: 420,
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      fontSize: 11.5,
      fontFamily: 'Montserrat, Arial',
      fontStyle: 'normal',
    },
    // References section
    {
      id: 'references-title',
      type: 'text',
      x: 330,
      y: 480,
      text: 'References',
      fontSize: 22,
      fontFamily: 'Montserrat, Arial',
      fontStyle: 'bold',
    },
    {
      id: 'references-underline',
      type: 'line',
      x: 330,
      y: 505,
      points: [330, 505, 750, 505],
      stroke: '#777',
      strokeWidth: 2,
    },
    {
      id: 'ref-1-name',
      type: 'text',
      x: 330,
      y: 520,
      text: 'Harumi Kobayashi',
      fontSize: 15,
      fontFamily: 'Montserrat, Arial',
      fontStyle: 'bold',
    },
    {
      id: 'ref-1-title',
      type: 'text',
      x: 330,
      y: 540,
      text: 'Wardiere Inc. / CEO',
      fontSize: 12,
      fontFamily: 'Montserrat, Arial',
      fontStyle: 'normal',
    },
    {
      id: 'ref-1-phone',
      type: 'text',
      x: 330,
      y: 560,
      text: 'Phone: 123-456-7890',
      fontSize: 9.5,
      fontFamily: 'Montserrat, Arial',
      fontStyle: 'normal',
    },
    {
      id: 'ref-1-email',
      type: 'text',
      x: 330,
      y: 575,
      text: 'Email: hello@reallygreatsite.com',
      fontSize: 9.5,
      fontFamily: 'Montserrat, Arial',
      fontStyle: 'normal',
    },
    {
      id: 'ref-2-name',
      type: 'text',
      x: 550,
      y: 520,
      text: 'Bailey Dupont',
      fontSize: 15,
      fontFamily: 'Montserrat, Arial',
      fontStyle: 'bold',
    },
    {
      id: 'ref-2-title',
      type: 'text',
      x: 550,
      y: 540,
      text: 'Wardiere Inc. / CEO',
      fontSize: 12,
      fontFamily: 'Montserrat, Arial',
      fontStyle: 'normal',
    },
    {
      id: 'ref-2-phone',
      type: 'text',
      x: 550,
      y: 560,
      text: 'Phone: 123-456-7890',
      fontSize: 9.5,
      fontFamily: 'Montserrat, Arial',
      fontStyle: 'normal',
    },
    {
      id: 'ref-2-email',
      type: 'text',
      x: 550,
      y: 575,
      text: 'Email: hello@reallygreatsite.com',
      fontSize: 9.5,
      fontFamily: 'Montserrat, Arial',
      fontStyle: 'normal',
    },
  ]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [editingTextValue, setEditingTextValue] = useState('');
  const [editingPosition, setEditingPosition] = useState({ x: 0, y: 0, width: 0, height: 0, fontSize: 20, fontFamily: 'Arial', fontStyle: 'normal' });
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const editableDivRef = useRef<HTMLDivElement>(null);

  const checkDeselect = (e: any) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedId(null);
      if (editingTextId) {
        setEditingTextId(null);
      }
    }
  };

  const addText = () => {
    const newElement: CanvasElement = {
      id: Date.now().toString(),
      type: 'text',
      x: 100,
      y: 100,
      text: 'New Text',
      fontSize: 20,
      fontFamily: 'Arial',
      fontStyle: 'normal',
    };
    setElements([...elements, newElement]);
  };

  const addRect = () => {
    const newElement: CanvasElement = {
      id: Date.now().toString(),
      type: 'rect',
      x: 100,
      y: 100,
      width: 200,
      height: 100,
      fill: '#3b82f6',
    };
    setElements([...elements, newElement]);
  };

  const addCircle = () => {
    const newElement: CanvasElement = {
      id: Date.now().toString(),
      type: 'circle',
      x: 150,
      y: 150,
      width: 50,
      height: 50,
      fill: '#ef4444',
    };
    setElements([...elements, newElement]);
  };

  const addImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result as string;
        img.onload = () => {
          const newElement: CanvasElement = {
            id: Date.now().toString(),
            type: 'image',
            x: 100,
            y: 100,
            width: img.width,
            height: img.height,
            image: img,
          };
          setElements([...elements, newElement]);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const deleteSelected = () => {
    if (selectedId) {
      setElements(elements.filter((el) => el.id !== selectedId));
      setSelectedId(null);
    }
  };

  const handleTextDoubleClick = (element: CanvasElement) => {
    const textNode = stageRef.current?.findOne(`#${element.id}`);
    if (textNode && stageRef.current) {
      const textPosition = textNode.position();
      const stageBox = stageRef.current.container().getBoundingClientRect();
      const containerBox = stageRef.current.container().parentElement?.getBoundingClientRect();
      
      // Calculate position relative to the container
      const relativeX = textPosition.x;
      const relativeY = textPosition.y;
      
      setEditingTextId(element.id);
      setEditingTextValue(element.text || '');
      setEditingPosition({
        x: relativeX,
        y: relativeY,
        width: textNode.width() || 200,
        height: textNode.height() || 30,
        fontSize: element.fontSize || 20,
        fontFamily: element.fontFamily || 'Arial',
        fontStyle: element.fontStyle || 'normal',
      });
    }
  };

  const handleTextUpdate = (value: string) => {
    if (editingTextId) {
      setElements(
        elements.map((el) =>
          el.id === editingTextId ? { ...el, text: value } : el
        )
      );
    }
  };

  const handleTextClose = () => {
    setEditingTextId(null);
  };

  useEffect(() => {
    if (editingTextId && editableDivRef.current) {
      editableDivRef.current.focus();
      // Select all text
      const range = document.createRange();
      range.selectNodeContents(editableDivRef.current);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (editingTextId && editableDivRef.current && !editableDivRef.current.contains(e.target as Node)) {
        handleTextClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editingTextId]);

  const exportToPDF = async () => {
    if (stageRef.current) {
      const dataURL = stageRef.current.toDataURL({ pixelRatio: 2 });
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [794, 1123],
      });
      
      const imgProps = pdf.getImageProperties(dataURL);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(dataURL, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('cv-template.pdf');
      
      if (onDownloadPDF) {
        onDownloadPDF();
      }
    }
  };

  const saveCanvas = () => {
    if (stageRef.current) {
      const dataURL = stageRef.current.toDataURL({ pixelRatio: 2 });
      if (onSave) {
        onSave(dataURL);
      }
    }
  };

  useEffect(() => {
    if (selectedId && transformerRef.current) {
      const selectedNode = stageRef.current?.findOne(`#${selectedId}`);
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
        transformerRef.current.getLayer()?.batchDraw();
      }
    }
  }, [selectedId]);

  useImperativeHandle(ref, () => ({
    addText,
    addRect,
    addCircle,
    addImage,
    deleteSelected,
    saveCanvas,
    exportToPDF,
  }));

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 bg-gray-100 overflow-auto flex items-center justify-center">
        <div className="bg-white shadow-lg relative" style={{ width: '794px', height: '1123px' }}>
          <Stage
            width={794}
            height={1123}
            ref={stageRef}
            onMouseDown={checkDeselect}
            onTap={checkDeselect}
          >
            <Layer>
              {elements.map((element) => {
                const isSelected = element.id === selectedId;
                
                if (element.type === 'text') {
                  const isEditingThis = editingTextId === element.id;
                  return (
                    <Text
                      key={element.id}
                      id={element.id}
                      x={element.x}
                      y={element.y}
                      text={element.text}
                      fontSize={element.fontSize}
                      fontFamily={element.fontFamily}
                      fontStyle={element.fontStyle}
                      draggable={!editingTextId}
                      visible={!isEditingThis}
                      onDragEnd={(e) => {
                        setElements(
                          elements.map((el) =>
                            el.id === element.id
                              ? { ...el, x: e.target.x(), y: e.target.y() }
                              : el
                          )
                        );
                      }}
                      onClick={() => setSelectedId(element.id)}
                      onTap={() => setSelectedId(element.id)}
                      onDblClick={() => handleTextDoubleClick(element)}
                    />
                  );
                }
                
                if (element.type === 'rect') {
                  return (
                    <Rect
                      key={element.id}
                      id={element.id}
                      x={element.x}
                      y={element.y}
                      width={element.width}
                      height={element.height}
                      fill={element.fill}
                      draggable
                      onDragEnd={(e) => {
                        setElements(
                          elements.map((el) =>
                            el.id === element.id
                              ? { ...el, x: e.target.x(), y: e.target.y() }
                              : el
                          )
                        );
                      }}
                      onClick={() => setSelectedId(element.id)}
                      onTap={() => setSelectedId(element.id)}
                    />
                  );
                }
                
                if (element.type === 'circle') {
                  return (
                    <Circle
                      key={element.id}
                      id={element.id}
                      x={element.x}
                      y={element.y}
                      radius={element.width ? element.width / 2 : 25}
                      fill={element.fill}
                      draggable
                      onDragEnd={(e) => {
                        setElements(
                          elements.map((el) =>
                            el.id === element.id
                              ? { ...el, x: e.target.x(), y: e.target.y() }
                              : el
                          )
                        );
                      }}
                      onClick={() => setSelectedId(element.id)}
                      onTap={() => setSelectedId(element.id)}
                    />
                  );
                }
                
                if (element.type === 'image' && element.image) {
                  return (
                    <KonvaImage
                      key={element.id}
                      id={element.id}
                      image={element.image}
                      x={element.x}
                      y={element.y}
                      width={element.width}
                      height={element.height}
                      draggable
                      onDragEnd={(e) => {
                        setElements(
                          elements.map((el) =>
                            el.id === element.id
                              ? { ...el, x: e.target.x(), y: e.target.y() }
                              : el
                          )
                        );
                      }}
                      onClick={() => setSelectedId(element.id)}
                      onTap={() => setSelectedId(element.id)}
                    />
                  );
                }

                if (element.type === 'line' && element.points) {
                  return (
                    <Line
                      key={element.id}
                      id={element.id}
                      points={element.points}
                      stroke={element.stroke || '#000'}
                      strokeWidth={element.strokeWidth || 2}
                      draggable
                      onDragEnd={(e) => {
                        setElements(
                          elements.map((el) =>
                            el.id === element.id
                              ? { ...el, x: e.target.x(), y: e.target.y() }
                              : el
                          )
                        );
                      }}
                      onClick={() => setSelectedId(element.id)}
                      onTap={() => setSelectedId(element.id)}
                    />
                  );
                }

                return null;
              })}
              
              <Transformer
                ref={transformerRef}
                visible={!!selectedId}
                boundBoxFunc={(oldBox, newBox) => {
                  if (newBox.width < 5 || newBox.height < 5) {
                    return oldBox;
                  }
                  return newBox;
                }}
              />
            </Layer>
          </Stage>

          {editingTextId && (
            <div
              ref={editableDivRef}
              contentEditable
              suppressContentEditableWarning
              onInput={(e) => handleTextUpdate(e.currentTarget.textContent || '')}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  handleTextClose();
                }
              }}
              style={{
                position: 'absolute',
                top: editingPosition.y,
                left: editingPosition.x,
                fontSize: editingPosition.fontSize,
                fontFamily: editingPosition.fontFamily,
                fontStyle: editingPosition.fontStyle,
                fontWeight: editingPosition.fontStyle === 'bold' ? 'bold' : 'normal',
                padding: '0',
                margin: '0',
                border: '2px solid #3b82f6',
                outline: 'none',
                minWidth: editingPosition.width,
                minHeight: editingPosition.height,
                zIndex: 1000,
                cursor: 'text',
                background: 'transparent',
                color: '#000',
                whiteSpace: 'pre',
              }}
            >
              {editingTextValue}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

CanvasEditor.displayName = 'CanvasEditor';

export default CanvasEditor;
