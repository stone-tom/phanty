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
- add layout blocks (seperators)
- add context menu with edit and delete
- add empty state to content block list empty accordions
- when opening the text field form, focus label
- previews (layout in both lists)
- context menu for layout blocks
- validation
- form submissions
- check what is needed for tanstack star
- test setup? + tests for block editor

### later
- prefill form fields (values) with data from the system (placeholder)
- templates: reuse layout components with inner content (e.g. base data selction can be pasted into another one)
- conditions for every block (usage should be very simple)

## the table
- pagination
- column pinning (dynamic)
- column sorting
- hide columns
- persist table state
- single column grid sort

# Ideas

## Form Filling UI
- projects will have documents - form questions could have a button for e.g. "save to documents", so files get transferred directly.
- progress indicator

## FormBuilder
- banner in form, if field is conditionally dependent on another field (ux flow better)

## Meeting Notes / Project Notes
Should be shareable internal and also to customers. Can contain documents, assets and text so info material does not need to be sent per e-mail always. Should also contain commenting.

## TODO Contracts
We could create a TODO list that can be shared with a customer, which contains TODOs that need to be done by potentially both sides. Internal and external People can then mark things as done and write comments to the done todos - should be attachable to meeting notes.