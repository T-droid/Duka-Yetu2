"use client";

import React, { useState } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useGetCategories } from "@/hooks/useGetResource";

interface CategoryComboBoxProps {
  value?: string;
  onValueChange?: (value: string) => void;
  onCategoryTypeChange?: (isExisting: boolean) => void;
  placeholder?: string;
  className?: string;
}

export function CategoryComboBox({
  value,
  onValueChange,
  onCategoryTypeChange,
  placeholder = "Select or create category...",
  className,
}: CategoryComboBoxProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const { data: categories = [], isLoading, error } = useGetCategories();

  const handleSelect = (selectedValue: string) => {
    const newValue = selectedValue === value ? "" : selectedValue;
    onValueChange?.(newValue);
    onCategoryTypeChange?.(true); // This is an existing category
    setOpen(false);
    setInputValue("");
  };

  const handleCreateNew = () => {
    if (inputValue.trim()) {
      onValueChange?.(inputValue.trim());
      onCategoryTypeChange?.(false); // This is a new category
      setOpen(false);
      setInputValue("");
    }
  };

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(inputValue.toLowerCase())
  );

  const exactMatch = categories.find(
    (category) => category.name.toLowerCase() === inputValue.toLowerCase()
  );

  const showCreateOption = inputValue.trim() && !exactMatch;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between", className)}
        >
          {value || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput
            placeholder="Search or create category..."
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading 
                ? "Loading categories..." 
                : error 
                ? "Error loading categories. You can still create new ones." 
                : "No categories found."}
            </CommandEmpty>
            
            {filteredCategories.length > 0 && (
              <CommandGroup>
                {filteredCategories.map((category) => (
                  <CommandItem
                    key={category.id}
                    value={category.name}
                    onSelect={handleSelect}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === category.name ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {category.name}
                    {category.description && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        - {category.description}
                      </span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {showCreateOption && (
              <CommandGroup>
                <CommandItem onSelect={handleCreateNew}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create "{inputValue.trim()}"
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
