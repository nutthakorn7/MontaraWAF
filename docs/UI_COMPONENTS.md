# Montara WAF UI Component Library

**Total: 24 Components** | Built with TypeScript + Tailwind CSS

## 📦 Import

```tsx
import { Button, Modal, Card, DataTable, Toggle } from '@/components/ui';
```

---

## 🎨 Core Form Components

### Button
```tsx
<Button variant="primary" size="md" loading={false} icon={<Save />}>
  Submit
</Button>
```
**Variants:** primary, secondary, ghost, danger | **Sizes:** sm, md, lg

### Input
```tsx
<Input label="Email" type="email" error="Invalid" icon={<Mail />} />
```

### Select
```tsx
<Select label="Country" options={[{ value: 'us', label: 'USA' }]} />
```

### Toggle (NEW)
```tsx
<Toggle checked={on} onChange={setOn} label="Enable" size="md" color="green" />
```
**Colors:** green, blue, red | **Sizes:** sm, md, lg

### Checkbox (NEW)
```tsx
<Checkbox checked={agreed} onChange={setAgreed} label="Agree" />
<CheckboxGroup options={items} value={selected} onChange={setSelected} />
```

### RadioGroup (NEW)
```tsx
<RadioGroup options={options} value={selected} onChange={setSelected} />
```

---

## 📐 Layout Components

### Modal
```tsx
<Modal isOpen={show} onClose={() => setShow(false)} title="Confirm" size="md">
  Content here
</Modal>
```

### Card
```tsx
<Card hover>
  <CardHeader><CardTitle>Title</CardTitle></CardHeader>
  Content
</Card>
```

### Tabs (NEW)
```tsx
<Tabs 
  tabs={[
    { id: 'overview', label: 'Overview', badge: 5 },
    { id: 'settings', label: 'Settings' }
  ]}
  activeTab="overview"
  onChange={setTab}
  variant="pills" // default, pills, underline
/>
```

### Dropdown (NEW)
```tsx
<Dropdown
  trigger={<Button>Actions</Button>}
  items={[
    { id: 'edit', label: 'Edit', icon: <Edit /> },
    { id: 'delete', label: 'Delete', danger: true }
  ]}
/>
<DropdownButton label="Options" items={items} />
```

---

## 📊 Data Display

### DataTable
```tsx
<DataTable<User>
  keyField="id"
  data={users}
  columns={[
    { key: 'name', header: 'Name', sortable: true },
    { key: 'status', header: 'Status', render: (u) => <Badge>{u.status}</Badge> }
  ]}
  onRowClick={(user) => select(user)}
/>
```

### StatCard
```tsx
<StatCard 
  title="Total Users" 
  value="12,847" 
  icon={<Users />} 
  trend={{ value: 12, isPositive: true }} 
/>
```

### Badge
```tsx
<Badge variant="success" size="sm">Active</Badge>
<StatusBadge status="active" />
<SeverityBadge severity="critical" />
```

### Avatar (NEW)
```tsx
<Avatar src="/user.jpg" name="John Doe" size="md" status="online" />
<AvatarGroup avatars={users} max={4} />
```
**Sizes:** xs, sm, md, lg, xl | **Status:** online, offline, away, busy

### ProgressBar (NEW)
```tsx
<ProgressBar value={75} max={100} color="blue" showLabel />
<CircularProgress value={75} size={80} />
```
**Colors:** blue, green, yellow, red, purple, gradient

---

## ⏳ Feedback & Loading

### Toast
```tsx
// Wrap app with <ToastProvider>
const { showToast } = useToast();
showToast({ type: 'success', message: 'Saved!' });
```

### Alert (NEW)
```tsx
<Alert variant="warning" title="Warning" dismissible onDismiss={() => {}}>
  Please review your settings
</Alert>
```
**Variants:** info, success, warning, error

### Tooltip (NEW)
```tsx
<Tooltip content="Click to save" position="top">
  <Button>Save</Button>
</Tooltip>
```
**Positions:** top, bottom, left, right

### Skeleton
```tsx
<SkeletonStats count={4} />
<SkeletonTable rows={5} columns={4} />
<SkeletonCard />
```

---

## 🔍 Navigation

### Pagination (NEW)
```tsx
<Pagination 
  currentPage={1} 
  totalPages={10} 
  onPageChange={setPage}
  showFirstLast
/>
```

### SearchBar
```tsx
<SearchBar value={query} onChange={setQuery} debounceMs={300} />
```

### HelpDropdown
Built-in help menu with search.

---

## 🌙 Dark Mode

All components include `dark:` Tailwind variants.

---

## 📖 Storybook

Interactive component documentation with visual testing.

```bash
npm run storybook        # Start at localhost:6006
npm run build-storybook  # Build static site
```

**19 story files** covering all components with multiple variants.

---

*Updated: 2026-01-14*
