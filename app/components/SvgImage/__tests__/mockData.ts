const styleInitialValue = 'style="enable-background: new 0 0 1052 744;"';

const styleExpectedValue = {
  key: 'enable-background',
  value: 'new 0 0 1052 744',
};

const mockSVGNormal = `<svg data-testid="mock" 
viewBox="0 0 105 93" xmlns="http://www.w3.org/2000/svg">
<path d="M66,0h39v93zM38,0h-38v93zM52,35l25,58h-16l-8-18h-18z" fill="#ED1C24"/>
</svg>`;

const mockSVGWithStyle = `<svg data-testid="mock" ${styleInitialValue} 
viewBox="0 0 105 93" xmlns="http://www.w3.org/2000/svg">
<path d="M66,0h39v93zM38,0h-38v93zM52,35l25,58h-16l-8-18h-18z" fill="#ED1C24"/>
</svg>`;

const styleUnchangedExpectedValue = {
  key: 'style',
  value: 'margin: 4px;',
};

const mockSVGStyleInOtherTags = `<svg data-testid="mock" ${styleInitialValue} 
viewBox="0 0 105 93" xmlns="http://www.w3.org/2000/svg"><g data-testid="other" 
${styleUnchangedExpectedValue.key}="${styleUnchangedExpectedValue.value}"
d="M66,0h39v93zM38,0h-38v93zM52,35l25,58h-16l-8-18h-18z" fill="#ED1C24"></g></svg>`;

const mockSVGWithXMLTag = `<?xml version="1.0" encoding="utf-8"?>
<svg data-testid="mock" ${styleInitialValue} 
viewBox="0 0 105 93" xmlns="http://www.w3.org/2000/svg">
<path style="margin: 4px;" d="M66,0h39v93zM38,0h-38v93zM52,35l25,58h-16l-8-18h-18z" 
fill="#ED1C24"/></svg>`;

const mockSVGFormatError = `<xml data-testid="mock" style="color: red;" 
<svg ${styleInitialValue} 
viewBox="0 0 105 93" xmlns="http://www.w3.org/2000/svg">
<path style="margin: 4px;" d="M66,0h39v93zM38,0h-38v93zM52,35l25,58h-16l-8-18h-18z" 
fill="#ED1C24"/></svg</xml>`;

export {
  styleExpectedValue,
  styleUnchangedExpectedValue,
  mockSVGNormal,
  mockSVGWithStyle,
  mockSVGStyleInOtherTags,
  mockSVGWithXMLTag,
  mockSVGFormatError,
};
