# Needs to be done at some point 
(this is more a do not forget list)

## form templates
- add pagination to form templates table
- refactor to standard data table component (where we pass whole table to)
- add filters for form templates

## general
- 404 page
- 500 page
- Error boundaries (general)
- Error boundaries (dialogs)
- Dialog medias (icons in dialogs)

## block editor
### next up
- smoke test template document save rejects unknown block versions and ungranted block definitions
- small first renderer
- first block form (text)
- first block renderer (container + text)
- layout-block-list

### later
- prefill with data from the system (placeholder)
- reuse layout components with inner content (e.g. base data selction can be pasted into another one)
- conditions for every block (usage should be very simple)

## the table
- pagination
- column pinning (dynamic)
- column sorting
- hide columns
- persist table state
- single column grid sort

#Ideas

## Form Filling UI
- projects will have documents - form questions could have a button for e.g. "save to documents", so files get transferred directly.

## FormBuilder
- banner in form, if field is conditionally dependent on another field (ux flow better)
