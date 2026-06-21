import { FunctionComponent, KeyboardEvent, useState } from 'react';

import { X } from 'lucide-react';

import { OFFER_FIELD_LIMITS } from '../../../../../design-system/safeContent';



interface TagInputProps {

  tags: string[];

  onChange: (tags: string[]) => void;

  placeholder?: string;

  id?: string;

  maxTagLength?: number;

  maxTags?: number;

}



const TagInput: FunctionComponent<TagInputProps> = ({

  tags,

  onChange,

  placeholder,

  id,

  maxTagLength = OFFER_FIELD_LIMITS.tag,

  maxTags = 30,

}) => {

  const [input, setInput] = useState('');



  const addTag = (raw: string) => {

    const value = raw.trim().slice(0, maxTagLength);

    if (!value || tags.includes(value) || tags.length >= maxTags) return;

    onChange([...tags, value]);

    setInput('');

  };



  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {

    if (e.key === 'Enter' || e.key === ',') {

      e.preventDefault();

      addTag(input);

    }

    if (e.key === 'Backspace' && !input && tags.length > 0) {

      onChange(tags.slice(0, -1));

    }

  };



  const handleInputChange = (value: string) => {

    setInput(value.slice(0, maxTagLength));

  };



  return (

    <div className="offer-tag-input">

      {tags.map((tag) => (

        <span key={tag} className="offer-tag" title={tag.length > 20 ? tag : undefined}>

          <span className="offer-tag__label">{tag}</span>

          <button

            type="button"

            className="offer-tag__remove"

            onClick={() => onChange(tags.filter((t) => t !== tag))}

            aria-label={`Remove ${tag}`}

          >

            <X className="h-3 w-3" />

          </button>

        </span>

      ))}

      <input

        id={id}

        className="offer-tag-input__field"

        value={input}

        onChange={(e) => handleInputChange(e.target.value)}

        onKeyDown={handleKeyDown}

        onBlur={() => addTag(input)}

        placeholder={tags.length === 0 ? placeholder : ''}

        maxLength={maxTagLength}

        disabled={tags.length >= maxTags}

      />

    </div>

  );

};



export default TagInput;

