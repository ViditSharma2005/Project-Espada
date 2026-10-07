import unittest
from main import split_prompt, build_segment_prompts


class PromptTests(unittest.TestCase):
    def test_three_sections(self):
        parts = split_prompt("First action happens. Second action happens. Third action happens.")
        self.assertEqual(len(parts), 3)
        self.assertTrue(all(parts))

    def test_lock_repeated(self):
        master = "A person walks. They open a door. They enter the room."
        prompts = build_segment_prompts(master)
        self.assertEqual(len(prompts), 3)
        self.assertTrue(all(master in p for p in prompts))
        self.assertIn("seconds 10–20", prompts[1])


if __name__ == "__main__":
    unittest.main()
