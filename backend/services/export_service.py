from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Image as RLImage, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from io import BytesIO
import base64
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

class ExportService:
    """Service for exporting presentations to various formats"""
    
    @staticmethod
    def generate_pdf(presentation_data: Dict[str, Any], slides_data: List[Dict[str, Any]]) -> BytesIO:
        """
        Generate a PDF from presentation and slide data
        
        Args:
            presentation_data: Presentation metadata (title, description)
            slides_data: List of slide data with elements
            
        Returns:
            BytesIO: PDF file as bytes
        """
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=0.5*inch,
            leftMargin=0.5*inch,
            topMargin=0.5*inch,
            bottomMargin=0.5*inch,
        )
        
        # Container for the 'Flowable' objects
        elements = []
        styles = getSampleStyleSheet()
        
        # Custom styles
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1F2937'),
            spaceAfter=30,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        )
        
        slide_title_style = ParagraphStyle(
            'SlideTitle',
            parent=styles['Heading2'],
            fontSize=18,
            textColor=colors.HexColor('#2563EB'),
            spaceAfter=12,
            alignment=TA_LEFT,
            fontName='Helvetica-Bold'
        )
        
        content_style = ParagraphStyle(
            'Content',
            parent=styles['BodyText'],
            fontSize=12,
            textColor=colors.HexColor('#374151'),
            spaceAfter=12,
            leading=16
        )
        
        # Title page
        title = Paragraph(presentation_data.get('title', 'Untitled Presentation'), title_style)
        elements.append(title)
        
        if presentation_data.get('description'):
            description = Paragraph(presentation_data['description'], content_style)
            elements.append(description)
        
        elements.append(Spacer(1, 0.5*inch))
        elements.append(PageBreak())
        
        # Process each slide
        for idx, slide in enumerate(slides_data, 1):
            # Slide number and title
            slide_title_text = f"Slide {idx}: {slide.get('title', 'Untitled Slide')}"
            slide_title = Paragraph(slide_title_text, slide_title_style)
            elements.append(slide_title)
            elements.append(Spacer(1, 0.2*inch))
            
            # Process slide elements
            slide_elements = slide.get('elements', [])
            
            # Separate text and image elements
            text_elements = [e for e in slide_elements if e.get('type') == 'text']
            image_elements = [e for e in slide_elements if e.get('type') == 'image']
            
            # Add text content
            for element in text_elements:
                content = element.get('content', {}).get('text', '')
                if content:
                    # Clean up content
                    content = content.replace('\n', '<br/>')
                    para = Paragraph(content, content_style)
                    elements.append(para)
                    elements.append(Spacer(1, 0.1*inch))
            
            # Add images
            for element in image_elements:
                try:
                    image_url = element.get('content', {}).get('url', '')
                    if image_url and image_url.startswith('data:image'):
                        # Extract base64 data
                        image_data = image_url.split(',')[1]
                        image_bytes = base64.b64decode(image_data)
                        img_buffer = BytesIO(image_bytes)
                        
                        # Add image to PDF
                        img = RLImage(img_buffer, width=4*inch, height=3*inch)
                        elements.append(img)
                        elements.append(Spacer(1, 0.2*inch))
                except Exception as e:
                    logger.warning(f"Could not add image to PDF: {e}")
            
            # Add speaker notes if present
            notes = slide.get('notes', '')
            if notes:
                notes_style = ParagraphStyle(
                    'Notes',
                    parent=styles['Italic'],
                    fontSize=10,
                    textColor=colors.HexColor('#6B7280'),
                    spaceAfter=12,
                    leftIndent=20
                )
                notes_para = Paragraph(f"<i>Notes: {notes}</i>", notes_style)
                elements.append(notes_para)
            
            # Page break between slides (except last slide)
            if idx < len(slides_data):
                elements.append(PageBreak())
        
        # Build PDF
        try:
            doc.build(elements)
            buffer.seek(0)
            return buffer
        except Exception as e:
            logger.error(f"Error building PDF: {e}")
            raise
    
    @staticmethod
    def generate_share_token() -> str:
        """Generate a unique share token for public presentations"""
        import secrets
        return secrets.token_urlsafe(32)
