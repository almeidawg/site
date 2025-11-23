import React, { useEffect, useState, useRef } from 'react';

const SearchSelect = ({
  placeholder,
  fetcher,
  onSelect,
  initialLabel
}) => {
  const [term, setTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState([]);
  const [selectedLabel, setSelectedLabel] = useState(initialLabel || '');
  const wrapperRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!open || term.length < 2) {
        setOpts([]);
        return;
      }
      try {
        const r = await fetcher(term);
        if (mounted) setOpts(r);
      } catch (error) {
        console.error("Failed to fetch search results", error);
        if(mounted) setOpts([]);
      }
    };
    const debounce = setTimeout(run, 300);
    return () => {
      mounted = false;
      clearTimeout(debounce);
    };
  }, [term, open, fetcher]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  useEffect(() => {
    if (!initialLabel) {
      setSelectedLabel('');
      setTerm('');
    } else {
        setSelectedLabel(initialLabel);
    }
  }, [initialLabel]);


  return (
    <div className="relative" ref={wrapperRef}>
      <input
        className="w-full px-3 py-2 text-sm leading-tight text-gray-700 border rounded shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={placeholder}
        value={selectedLabel || term}
        onChange={(e) => {
          setSelectedLabel('');
          setTerm(e.target.value);
          if (e.target.value === '') {
            onSelect(null);
          }
        }}
        onFocus={() => setOpen(true)}
      />
      {open && opts.length > 0 && (
        <div className="absolute z-20 mt-1 bg-white border rounded w-full shadow-lg max-h-56 overflow-auto">
          {opts.map(o => (
            <div
              key={o.id}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
              onMouseDown={() => {
                setSelectedLabel(o.label);
                onSelect(o);
                setOpen(false);
                setTerm('');
              }}
            >
              {o.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchSelect;
